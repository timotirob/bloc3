import express from 'express';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import SequelizeStoreInit from 'connect-session-sequelize'; // Store pour Sequelize

// Imports locaux
import sequelize from './config/database.js';
import './config/passport-setup.js'; // Charge la config Passport
import User from './models/User.js';
import { hashMonMdp } from './utils/security.js';
import { isAuth, isAdmin } from './middleware/auth.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

// --- Configuration du Store de Session ---
const SequelizeStore = SequelizeStoreInit(session.Store);
const sessionStore = new SequelizeStore({
    db: sequelize,
    checkExpirationInterval: 15 * 60 * 1000, // Nettoyage toutes les 15min
    expiration: 24 * 60 * 60 * 1000 // Expire après 24h
});

// --- Middlewares ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Express
app.use(session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 jour
    }
}));

// Initialisation de Passport (APRÈS la session)
app.use(passport.initialize());
app.use(passport.session());

// Middleware de debug (optionnel, pour voir ce qui se passe)
app.use((req, res, next) => {
    console.log('Session:', req.session);
    console.log('User:', req.user); // Sera rempli si connecté
    next();
});

// --- ROUTES ---

// Accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

// Page Login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/login.html'));
});

// Page Enregistrement
app.get('/enregistrement', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/enregistrement.html'));
});

// Page Échec
app.get('/login-echec', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/login-echec.html'));
});

// --- TRAITEMENT AUTHENTIFICATION ---

// Traitement Enregistrement
app.post('/enregistrement', async (req, res) => {
    const { utilisateur, motDePasse, email } = req.body;
    try {
        const hash = await hashMonMdp(motDePasse);
        // Logique simple : si email contient 'admin', il est admin (pour le test)
        const isAdmin = email.includes('admin');

        await User.create({
            identifiant: utilisateur,
            hash: hash,
            email: email,
            admin: isAdmin
        });

        // On pourrait loguer l'utilisateur directement ici, mais on renvoie au login pour l'exemple
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erreur lors de l\'inscription');
    }
});

// Traitement Login (La magie de Passport opère ici)
app.post('/login', passport.authenticate('local', {
    successRedirect: '/route-protegee',
    failureRedirect: '/login-echec'
}));

// Logout
app.get('/logout', (req, res, next) => {
    // req.logout est asynchrone dans les dernières versions de Passport
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

// --- ROUTES PROTÉGÉES ---

app.get('/route-protegee', isAuth, (req, res) => {
    res.send(`
        <h1>Zone Membre</h1>
        <p>Bienvenue ${req.user.identifiant}.</p>
        <p>Votre rôle : ${req.user.admin ? 'Administrateur' : 'Utilisateur'}</p>
        <a href="/admin-route">Zone Admin</a><br>
        <a href="/logout">Se déconnecter</a>
    `);
});

app.get('/admin-route', isAdmin, (req, res) => {
    res.send(`
        <h1>Zone Administrateur</h1>
        <p>Bravo, vous avez les droits suprêmes.</p>
        <a href="/route-protegee">Retour</a>
    `);
});

// --- Démarrage ---
// Synchronisation BDD puis lancement serveur
sequelize.sync().then(() => {
    console.log('Base de données synchronisée.');
    app.listen(port, () => {
        console.log(`Serveur lancé sur http://localhost:${port}`);
    });
});