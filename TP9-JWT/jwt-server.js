import express from 'express';
import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import { User, RefreshToken, ActivityLog } from './models/jwt-models.js';

dotenv.config();

// Configuration des chemins pour ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- Middlewares ---
app.use(express.json()); // Remplace body-parser
app.use(express.urlencoded({ extended: true })); // Pour les formulaires classiques
app.use(cookieParser()); // Indispensable pour lire le refresh token dans les cookies
app.use('/static', express.static(path.join(__dirname, 'static'))); // Fichiers statiques (JS client)

const SECRET_KEY = process.env.SECRET_KEY;
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY;

// ================= ROUTES PAGES (GET) =================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "pages/enregistrement.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "pages/login.html"));
});

app.get("/logout", (req, res) => {
    res.sendFile(path.join(__dirname, "pages/logout.html"));
});

app.get("/accesProfil", (req, res) => {
    res.sendFile(path.join(__dirname, "pages/profil.html"));
});

// ================= ROUTES API (POST/GET) =================

// --- 1. INSCRIPTION ---
app.post('/enregistrement', async (req, res) => {
    const { identifiant: login, motDePasse: password, email } = req.body;

    if (!login || !password) {
        return res.status(400).json({ message: 'Login et mot de passe requis.' });
    }

    try {
        // Hachage avec Argon2 (Sel inclus automatiquement)
        const hashedPassword = await argon2.hash(password);

        const user = await User.create({ login, password: hashedPassword, email });
        await ActivityLog.create({ userId: user.id, activity: 'Utilisateur créé' });

        res.status(201).json({ message: 'Inscription réussie.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur (Email ou Login déjà pris ?)' });
    }
});

// --- 2. LOGIN (Création Tokens) ---
app.post('/login', async (req, res) => {
    // Note: Noms des champs du formulaire login.html
    const { identifiantFormulaire: login, motDePasseFormulaire: password } = req.body;

    try {
        const user = await User.findOne({ where: { login } });
        if (!user) return res.status(404).json({ message: 'Utilisateur inconnu.' });

        // Vérification Argon2
        if (!(await argon2.verify(user.password, password))) {
            return res.status(401).json({ message: 'Mot de passe incorrect.' });
        }

        // Création des Tokens
        // Access Token : Court (15 min), contient l'ID et le nom
        const accessToken = jwt.sign({ id: user.id, username: user.login }, SECRET_KEY, { expiresIn: '15m' });

        // Refresh Token : Long (7 jours), sert uniquement au renouvellement
        const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET_KEY, { expiresIn: '7d' });

        // Stockage BDD (pour pouvoir révoquer)
        await RefreshToken.create({ token: refreshToken, userId: user.id });
        await ActivityLog.create({ userId: user.id, activity: 'Connexion' });

        // Envoi du Refresh Token en Cookie HttpOnly (Sécurité XSS)
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // 'true' en HTTPS
            sameSite: 'Strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
        });

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: false,
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        // REDIRECTION DIRECTE
        res.redirect('/accesProfil');

        // Envoi de l'Access Token en JSON (sera stocké en mémoire par le client)
        //res.json({ accessToken });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

// --- 3. REFRESH TOKEN (Renouvellement) ---
app.post('/token', async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'Token requis.' });

    try {
        // 1. Vérifier si le token existe en BDD (non révoqué)
        const storedToken = await RefreshToken.findOne({ where: { token: refreshToken } });
        if (!storedToken) return res.status(403).json({ message: 'Token invalide (révoqué ou inconnu).' });

        // 2. Vérifier la signature cryptographique
        jwt.verify(refreshToken, REFRESH_SECRET_KEY, async (err, user) => {
            if (err) return res.status(403).json({ message: 'Token invalide ou expiré.' });

            // 3. Générer un NOUVEL Access Token
            // Note : 'user' contient le payload décodé du refresh token
            // Il faut s'assurer d'avoir les infos à jour (username), ici on suppose qu'elles n'ont pas changé
            // Ou refaire un User.findByPk(user.id) pour être sûr.
            const newAccessToken = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '15m' });

            await ActivityLog.create({ userId: user.id, activity: 'Token rafraîchi' });

            // MISE A JOUR du cookie Access Token
            res.cookie('accessToken', newAccessToken, {
                httpOnly: true,
                secure: false,
                maxAge: 15 * 60 * 1000
            });

            res.json({ accessToken: newAccessToken });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

// --- 4. DECONNEXION (Logout) ---
app.post('/logout', async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
        await RefreshToken.destroy({ where: { token: refreshToken } });
    }
    // On nettoie les DEUX cookies
    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
    res.redirect('/login'); // Redirection propre
});

// ================= MIDDLEWARE D'AUTHENTIFICATION =================


const authenticateToken = (req, res, next) => {
    // On cherche le token :
    // 1. Soit dans le Header (standard API)
    // 2. Soit dans le Cookie (notre nouvelle méthode simplifiée)
    const authHeader = req.headers['authorization'];
    const tokenFromHeader = authHeader && authHeader.split(' ')[1];

    const token = tokenFromHeader || req.cookies.accessToken;

    if (!token) return res.status(401).json({ message: 'Accès non autorisé (Token manquant)' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token invalide ou expiré' });
        req.user = user;
        next();
    });
};

// ================= ROUTES PROTEGEES (API) =================

// Route Profil (Nécessite un Access Token valide)
app.get('/profil', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'login', 'email', 'createdAt'] // Pas de mot de passe !
        });

        if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

        await ActivityLog.create({ userId: user.id, activity: 'Lecture Profil' });
        res.json({ user });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

// Démarrage
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur JWT démarré sur http://localhost:${PORT}`);
});