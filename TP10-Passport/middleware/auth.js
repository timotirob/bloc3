// Middleware pour vérifier si l'utilisateur est connecté
export const isAuth = (req, res, next) => {
    // Passport ajoute la méthode isAuthenticated() à l'objet request
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).send('<h1>Accès refusé</h1><p>Vous devez être connecté. <a href="/login">Login</a></p>');
};

// Middleware pour vérifier si l'utilisateur est Admin
export const isAdmin = (req, res, next) => {
    // On vérifie d'abord s'il est connecté, puis son rôle
    if (req.isAuthenticated() && req.user.admin) {
        return next();
    }
    res.status(403).send('<h1>Accès interdit</h1><p>Réservé aux administrateurs.</p>');
};