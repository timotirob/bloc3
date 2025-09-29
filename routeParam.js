import express from 'express';
const app = express();
const port = 3000;
const __dirname = import.meta.dirname;


app.get('/', (requete, resultat, suivant) => {
    resultat.send('La racine du site')
})
app.get('/prenom', (requete, resultat, suivant) => {
    const prenom = requete.query.prenom || 'inconnu';

    resultat.send(`Bonjour ${prenom} !`);

})

app.get('/nom/:nom', (requete, resultat, suivant) => {
    const nom = requete.params.nom || 'inconnu';
    resultat.send(`Bonjour ${nom} !`);
})

app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});