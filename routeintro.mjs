import express from 'express';
const app = express();
const port = 3000;
const __dirname = import.meta.dirname;
// Middleware to log request details

app.get('/', (requete, resultat, suivant) => {
    resultat.send('La racine du site')
})


app.get('/accueil', (requete, resultat, suivant) => {
    resultat.send('Bonjour aux SIO2 avec hot reloading !')

})

app.get('/bienvenue', (requete, resultat, suivant) => {
    resultat.sendFile(__dirname+'/bienvenue.html')
})

app.get('/hellohot', (requete, resultat, suivant) => {
    resultat.send('Bonjour aux SIO2 pas de hot reloading avec Node tout court!')

})

app.get('/panorama', (requete, resultat, suivant) => {
    resultat.sendFile(__dirname+'/planDuSite.html')
})

app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});