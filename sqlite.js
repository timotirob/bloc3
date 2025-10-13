// 1. Import de la bibliothèque
import Database from 'better-sqlite3';

// 2. Connexion à la base de données (un fichier 'blog.db' sera créé)
const db = new Database('eleve.db');

import express from 'express';
import path from 'path';
const __dirname = import.meta.dirname; // Syntaxe moderne pour __dirname

const app = express();
const port = 3000;

// Middleware pour parser le corps des requêtes de formulaire
app.use(express.urlencoded({ extended: true }));

app.get('/formulaire', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/ajoutEleve.html'));
});

db.exec(`
  CREATE TABLE IF NOT EXISTS eleve (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    NOM TEXT NOT NULL,
    PRENOM TEXT
  )
`);
app.post('/ajouter', async (req, res) => {
    const {nom, prenom} = req.body; // Récupère nom et prenom du formulaire
    const sql = db.prepare('INSERT INTO eleve (NOM, PRENOM) VALUES (?, ?)');

    const nouvelEleve = {nom: nom, prenom: prenom};

    try {
        const info = sql.run(nouvelEleve.nom, nouvelEleve.prenom);

        // `info` contient des informations sur l'opération
        console.log(`✅ Article inséré avec succès ! ID: ${info.lastInsertRowid}`);

    } catch (err) {
        console.error("❌ Erreur lors de l'insertion :", err.message);
    }

// 6. Fermeture de la connexion
    db.close();

});

app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});



