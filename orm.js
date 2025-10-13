import { Sequelize, DataTypes } from 'sequelize';

// 1. Initialisation de Sequelize
const sequelize = new Sequelize('nodemysql', 'root', '', {
    host: 'localhost',
    dialect: 'mysql' // Très important de spécifier le SGBD
});

// 2. Test de la connexion (utilise les Promesses)
sequelize.authenticate()
    .then(() => {
        console.log('La connexion à la BDD est correcte.');
    })
    .catch((erreur) => {
        console.error('Impossible de se connecter à la BDD:', erreur);
    });

const Notes = sequelize.define('notes_eleves', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    note: {
        type: DataTypes.FLOAT,
        allowNull: false // La note ne peut pas être vide
    },
    date_eval: {
        type: DataTypes.DATEONLY
    }
});

// 4. Synchronisation et insertion
// .sync() crée la table si elle n'existe pas
sequelize.sync().then(async () => {
    console.log('Table "notes_eleves" créée avec succès !');

    try {
        // On utilise la méthode .create() du modèle pour insérer une ligne
        const noteTim = await Notes.create({
            note: 12.5,
            date_eval: new Date(2025, 9, 9), // mois 9 = Octobre en JS
        });

        console.log('Note insérée :', noteTim.toJSON());
    } catch (erreur) {
        console.error('Impossible d\'insérer la note :', erreur);
    }

}).catch((erreur) => {
    console.error('Impossible de créer la table :', erreur);
});