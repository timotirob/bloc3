import express from 'express';
import path from 'path';
import argon2 from 'argon2'; // On utilise Argon2 directement
import pool from './db-config.js';

const __dirname = import.meta.dirname;
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// --- ROUTES GET ---

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/enregistrement.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/login.html'));
});

// --- ROUTES POST ---

// Enregistrement (Avec Argon2)
app.post('/register', async (req, res) => {
    const { login, email, telephone, motDePasse, confMdp } = req.body;

    if (motDePasse !== confMdp) {
        return res.status(400).send("Les mots de passe ne correspondent pas.");
    }

    try {
        // Hachage automatique (sel inclus et géré par Argon2)
        const hashedPassword = await argon2.hash(motDePasse);

        // Note : La colonne SALT devient inutile en BDD avec Argon2
        // On peut passer une chaine vide ou NULL si la colonne existe encore
        const sql = `INSERT INTO UTILISATEURS (login, motDePasse, EMAIL, TELEPHONE, SALT) VALUES (?, ?, ?, ?, '')`;

        await pool.execute(sql, [login, hashedPassword, email, telephone]);

        res.status(201).send("Inscrit avec succès ! <a href='/login'>Se connecter</a>");
    } catch (error) {
        console.error("Erreur inscription:", error);
        res.status(500).send("Erreur lors de l'inscription (login/email déjà pris ?).");
    }
});

// Login (Avec Argon2)
app.post('/login', async (req, res) => {
    const { login, motDePasse } = req.body;

    try {
        // 1. Récupérer l'utilisateur
        const [rows] = await pool.execute('SELECT * FROM UTILISATEURS WHERE login = ?', [login]);

        if (rows.length === 0) {
            return res.status(401).send("Login ou mot de passe incorrect.");
        }

        const user = rows[0];

        // 2. Vérifier le mot de passe avec Argon2
        // argon2.verify compare le mot de passe clair avec le hash stocké (qui contient déjà le sel)
        if (await argon2.verify(user.motDePasse, motDePasse)) {
            res.send(`Connexion réussie ! Bienvenue ${user.login}`);
        } else {
            res.status(401).send("Login ou mot de passe incorrect.");
        }

    } catch (error) {
        console.error("Erreur login:", error);
        res.status(500).send("Erreur serveur.");
    }
});

app.listen(port, () => {
    console.log(`Serveur Auth (Argon2) démarré sur http://localhost:${port}`);
});