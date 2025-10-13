import express from 'express';
import mysql from 'mysql2/promise';
import path from 'path';
const __dirname = import.meta.dirname; // Syntaxe moderne pour __dirname

const app = express();
const port = 3000;

// Middleware pour parser le corps des requêtes de formulaire
app.use(express.urlencoded({ extended: true }));

// Configuration de la connexion (à sortir dans une fonction pour être réutilisable)
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'nodemysql'
};

// Route GET pour afficher le formulaire
app.get('/formulaire', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/ajoutEleve.html'));
});

// Route POST pour traiter les données du formulaire
app.post('/ajouter', async (req, res) => {
    const { nom, prenom } = req.body; // Récupère nom et prenom du formulaire
    const nouvelEleve = { NOM: nom, PRENOM: prenom };

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const sql = 'INSERT INTO eleves SET ?';

        // Le '?' est un placeholder. mysql2 le remplace de manière sécurisée par l'objet nouvelEleve
        await connection.query(sql, nouvelEleve);

        res.send(`Élève ${prenom} ${nom} ajouté avec succès !`);
    } catch (error) {
        console.error("Erreur lors de l'insertion :", error);
        res.status(500).send("Erreur serveur lors de l'ajout de l'élève.");
    } finally {
        if (connection) connection.end();
    }
});

app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});