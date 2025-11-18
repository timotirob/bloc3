import express from 'express';
import session from 'express-session';
import MySQLStoreFactory from 'express-mysql-session'; // La librairie standard
import path from 'path';
import argon2 from 'argon2';
import pool from './db-config.js'; // On garde le pool pour nos requêtes à nous (login)
import dotenv from 'dotenv';

dotenv.config();

const __dirname = import.meta.dirname;
const app = express();
const port = process.env.PORT || 3000;

// --- CONFIGURATION DU STORE DE SESSION ---

// 1. Initialiser le constructeur du Store
const MySQLStore = MySQLStoreFactory(session);

// 2. Options pour la session (les mêmes que dans .env)
const sessionDbOptions = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    // Options spécifiques au nettoyage
    clearExpired: true,
    checkExpirationInterval: 900000, // 15 minutes
    expiration: 86400000 // 1 jour
};

// 3. Créer le store
const sessionStore = new MySQLStore(sessionDbOptions);

// --- MIDDLEWARES ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware de Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret_par_defaut_insecure',
    store: sessionStore, // On utilise le nouveau store
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60, // 1 heure
        httpOnly: true,
        secure: false // Mettre à 'true' uniquement si vous êtes en HTTPS
    }
}));

// --- ROUTES ---

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/login.html'));
});

// Login avec création de Session
app.post('/login', async (req, res) => {
    const { login, motDePasse } = req.body;

    try {
        // On utilise notre pool 'promise' pour la requête SQL, ça c'est OK
        const [rows] = await pool.execute('SELECT * FROM UTILISATEURS WHERE login = ?', [login]);

        if (rows.length === 0 || !(await argon2.verify(rows[0].motDePasse, motDePasse))) {
            return res.status(401).send("Identifiants incorrects.");
        }

        // AUTHENTIFICATION RÉUSSIE -> MISE EN SESSION
        req.session.userId = rows[0].id;
        req.session.username = rows[0].login;
        req.session.isLogged = true;

        // Il est recommandé de sauvegarder explicitement avant de rediriger
        req.session.save(err => {
            if (err) {
                console.error(err);
                return res.status(500).send("Erreur de session");
            }
            res.redirect('/profil');
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Erreur serveur");
    }
});

// Route Protégée (Profil)
app.get('/profil', (req, res) => {
    if (!req.session.isLogged) {
        return res.redirect('/login');
    }

    res.send(`
        <h1>Espace Membre</h1>
        <p>Bienvenue, <strong>${req.session.username}</strong> !</p>
        <p>Votre ID de session : ${req.sessionID}</p>
        <a href="/logout">Se déconnecter</a>
    `);
});

// Déconnexion
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).send("Erreur déconnexion");
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

// Route Compteur (pour tester la persistance)
app.get('/compteur', (req, res) => {
    req.session.count = (req.session.count || 0) + 1;
    res.send(`Vous avez vu cette page ${req.session.count} fois.`);
});

app.listen(port, () => {
    console.log(`Serveur Sessions démarré sur http://localhost:${port}`);
});