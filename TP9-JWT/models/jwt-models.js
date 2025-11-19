import { Sequelize, DataTypes, Op } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Connexion à la BDD MySQL
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false // Désactive les logs SQL pour plus de clarté
    }
);

// --- Modèle Utilisateur ---
const User = sequelize.define('User', {
    login: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false }, // Hash Argon2
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
}, { timestamps: true });

// --- Modèle Refresh Token ---
const RefreshToken = sequelize.define('RefreshToken', {
    token: { type: DataTypes.STRING, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
}, { timestamps: true });

// --- Modèle Log d'Activité ---
const ActivityLog = sequelize.define('ActivityLog', {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    activity: { type: DataTypes.STRING, allowNull: false },
}, { timestamps: true });

// --- Synchronisation et Nettoyage Automatique ---
sequelize.sync()
    .then(() => {
        console.log('Base de données synchronisée.');

        // Tâche planifiée (simulée) pour nettoyer les vieux tokens toutes les 24h
        setInterval(async () => {
            const SEVEN_DAYS_AGO = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            await RefreshToken.destroy({
                where: { createdAt: { [Op.lt]: SEVEN_DAYS_AGO } },
            });
            console.log('Nettoyage des tokens expirés (> 7 jours) effectué.');
        }, 24 * 60 * 60 * 1000);
    })
    .catch(err => console.error('Erreur de synchro BDD:', err));

export { sequelize, User, RefreshToken, ActivityLog };