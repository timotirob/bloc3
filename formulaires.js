import express from 'express';
const app = express();
const port = 3000;
const __dirname = import.meta.dirname;

app.use(express.json());
// Middleware pour parser les données de formulaire (type application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));


app.post('/testform', (requete, resultat, suivant)=> {
    console.log('Bien reçu'+requete.body)

    resultat.json({
        message: 'Données bien reçues',
        donnees: requete.body
    })

    // Test avec POSTMAN ou bien

    // Test avec Curl:
    // curl -X POST http://localhost:3000/testform -H "Content-Type: application/x-www-form-urlencoded" -d "nom=Dupont" -d "age=35" -d "ville=Paris"

})

app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});