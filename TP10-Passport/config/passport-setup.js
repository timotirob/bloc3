import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import User from '../models/User.js';
import { verifieMdp } from '../utils/security.js';

// Configuration des champs (si vos inputs HTML ne s'appellent pas username/password)
const customFields = {
    usernameField: 'utilisateur', // name="utilisateur" dans le HTML
    passwordField: 'motDePasse'   // name="motDePasse" dans le HTML
};

// --- 1. Définition de la Stratégie Locale ---
const verifyCallback = async (username, password, done) => {
    try {
        // A. Recherche de l'utilisateur
        const user = await User.findOne({ where: { identifiant: username } });

        if (!user) {
            // Pas d'erreur technique (null), mais auth échouée (false)
            return done(null, false, { message: 'Utilisateur inconnu' });
        }

        // B. Vérification du mot de passe
        // === CORRECTION DU BUG SUBTIL ICI ===
        // On utilise 'await' car verifieMdp retourne une Promesse.
        // Sans 'await', isValid serait toujours true (car un objet Promise est truthy).
        const isValid = await verifieMdp(user.hash, password);

        if (isValid) {
            // Succès : on retourne l'utilisateur
            return done(null, user);
        } else {
            // Échec : mot de passe incorrect
            return done(null, false, { message: 'Mot de passe incorrect' });
        }
    } catch (err) {
        return done(err);
    }
};

const strategy = new LocalStrategy(customFields, verifyCallback);
passport.use(strategy);

// --- 2. Sérialisation (Stockage dans la session) ---
// On ne stocke que l'ID pour ne pas alourdir la session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// --- 3. Désérialisation (Récupération à chaque requête) ---
// À partir de l'ID stocké, on récupère tout l'objet User depuis la BDD
passport.deserializeUser(async (userId, done) => {
    try {
        const user = await User.findByPk(userId);
        done(null, user); // req.user sera désormais disponible
    } catch (err) {
        done(err);
    }
});