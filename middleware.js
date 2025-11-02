import express from 'express';
const app = express();
const port = 3000;

let nombreRequetes = 0 ;
app.get('/accueil', (requete, resultat, suivant) => {
    resultat.write('Accueil et on voudrait passer au suivant');
    resultat.end();
    suivant()
});

app.get('/login', (requete, resultat, suivant) => {
    resultat.write('Login et on voudrait passer au suivant');
    resultat.end();
    suivant()
});

app.get('/bonjour', (requete, resultat, suivant) => {
    resultat.write("Bonjour et on voudrait passer au suivant");
    suivant()
});

app.get('/', (requete, resultat, suivant) => {
    resultat.write("Ici c'est la racine et on voudrait passer au suivant");
    resultat.end();
    suivant()
});

// Attention: cette route est définie une deuxième fois !
app.get('/bonjour', (requete, resultat, suivant) => {
    console.log("On dit bonjour dans la console en plus");
    resultat.write("\nEncore bonjour vraiment j'insiste et on veut passer au suivant");
    resultat.end();
    suivant()
});

app.use((req, res, next) => {
    console.log('Time:', Date.now());
    next(); // Passe à la suite (autre middleware ou route)
});

app.use((requete,resultat,suivant) => {
    console.log('Nombre de requêtes reçues : '+nombreRequetes);
    console.log(`Nombre de requêtes reçues : ${nombreRequetes}`);
    nombreRequetes ++
    suivant()
})
app.get('/erreur-volontaire', (req, res, next) => {
    // On simule une erreur en la passant à next()
    next(new Error("Ceci est une erreur intentionnelle !"));
});

app.use((requete, resultat, suivant) => {
    console.log('Un middleware qui s\'exécute après les routes');
    suivant(new Error("la route n'existe pas !"));
})
app.use((err, req, res, next) => {
    console.error(err.stack); // Affiche l'erreur complète dans la console serveur
    res.status(500).send('Oups ! Quelque chose s\'est mal passé !');
});
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});