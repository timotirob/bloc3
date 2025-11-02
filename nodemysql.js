import mysql from 'mysql2/promise';

// On englobe notre code dans une fonction asynchrone pour pouvoir utiliser 'await'
async function main() {
    let connection;
    try {
        // 1. Définition et création de la connexion
        // Adaptez les identifiants à votre configuration locale
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '', // Ajoutez votre mot de passe si vous en avez un
            database: 'nodemysql'
        });

        // 2. Récupération des données
        // const [lignes, colonnes] = await connection.execute('SELECT * FROM eleves');
        const total = await connection.execute('SELECT * FROM eleves');

        // 3. Affichage dans la console
        //console.log("--- Lignes de données ---");
        //console.log(lignes);
        //console.log("\n--- Informations sur les colonnes ---");
       //console.log(colonnes);
        console.log(total)

    } catch (error) {
        console.error('Erreur de connexion ou de requête :', error);
    } finally {
        // 4. On s'assure de bien fermer la connexion à la fin
        if (connection) {
            connection.end();
        }
    }
}

// On exécute notre fonction principale
main();