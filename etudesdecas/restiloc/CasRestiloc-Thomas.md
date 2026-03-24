**Mission 1 : Gestion des prestations de remise en état (PREE)**

**Question 1.1 :** 

Voici une modification de la structure de la base de données pour intégrer la gestion des PREE :
Voici le modèle relationnel complété :

| Entité   | Attributs                                                      | Clé primaire            | Clé étrangère           |
|----------|---------------------------------------------------------------|-------------------------|-------------------------|
| Peinture | refDossier, numOrdre, elementCarrosserie, traitement          | refDossier, numOrdre    | refDossier, numOrdre    |
| Pièce    | refDossier, numOrdre, libellePiece, refPiece, qte             | refDossier, numOrdre    | refDossier, numOrdre    |

**Mission 2 : Gestion des rendez-vous :**

**Question 2.1 :** Le choix d'utiliser une classe abstraite pour la classe Expertise est qu'on ne peut pas instancier 
directement, elle permet d'éviter la duplication et de structurer le code 

**Question 2.2 :**

Méthode **AjouterExpertisePool** de la classe **SocieteFinancement** complété :

```csharp
public class SocieteFinancement {
    private string code;
    private string nom;
    private List<Expertise> lesExpertises;
    
public void AjouterExpertisePool(string unCode, DateTime uneDate, string unLieu, string uneAdresse, string uneImmat, string uneMarque, string unModele)
{
    // Création de l'objet spécialisé
    Pool_Garage uneExpertisePool = new Pool_Garage(unCode, uneDate, unLieu, uneAdresse, uneImmat, uneMarque, unModele);
    
    // Ajout à la liste gérée par la Société de Financement
    this.lesExpertises.Add(uneExpertisePool);
}
````
**Question 2.3 :**

Méthode **GetMotif** de la classe **Indisponibilite** :
```csharp
public class Indisponibilite {
    private string motif;
    private bool clientResponsable;

public string GetMotif()
{
    return this.motif;
}
````
**Question 2.4 :**

Méthode **LesExpertisesIndispos** de la classe **SocieteFinancement** :

```csharp
public class SocieteFinancement {
    private string code;
    private string nom;
    private List<Expertise> lesExpertises;
    
public List<Expertise> LesExpertisesIndispos()
{
    List<Expertise> indispos = new List<Expertise>();
    
    foreach (Expertise e in this.lesExpertises)
    {
        // On vérifie si l'expertise a un objet Indisponibilite rattaché
        if (e.GetIndisponibilite() != null)
        {
            indispos.Add(e);
        }
    }
    return indispos;
}
````

**Question 2.5 :**

Méthode **NbIndisponibilites** de la classe **SocieteFinancement** :
```csharp
public class SocieteFinancement {
private string code;
private string nom;
private List<Expertise> lesExpertises;
public int NbIndisponibilites(string unMotif)
{
    int compteur = 0;
    
    foreach (Expertise e in this.lesExpertises)
    {
        // On vérifie d'abord s'il y a une indispo, puis si le motif correspond
        if (e.GetIndisponibilite() != null && e.GetIndisponibilite().GetMotif() == unMotif)
        {
            compteur++;
        }
    }
    return compteur;
}

````
**Mission 3 : Application mobile pour les experts :**

**Question 3.1 :**
```sql
SELECT dateMission, heureMission, immatriculation, marque, modele, expert
FROM Mission
ORDER BY dateMission ASC, heureMission ASC;
````
````sql
SELECT expert, COUNT(*) AS nbVehicules
FROM Mission
WHERE YEAR(dateMission) = 2018
GROUP BY expert;
````
````sql
SELECT g.idGarage, g.nom, g.ville, g.telephone
FROM Garage g
JOIN Mission m ON g.idGarage = m.idGarage
GROUP BY g.idGarage, g.nom, g.ville, g.telephone
HAVING COUNT(m.idMission) > 100;
````
**Question 3.2 :**

sequenceDiagram
participant App as 📱 Application Android
participant Srv as 🌐 Serveur Apache (PHP)
participant BDD as 🗄️ SQL Server

    Note over App, BDD: Flux d'une requête (ex: Ajout d'une prestation)

    App->>Srv: 1. Envoi Requête HTTP (POST + JSON)
    Note right of App: Données de la prestation
    
    Srv->>Srv: 2. Traitement Logique & Sécurité
    Note right of Srv: Vérification des droits (PHP)

    Srv->>BDD: 3. Requête SQL (INSERT/UPDATE)
    Note right of Srv: Utilisation de PDO ou sqlsrv

    BDD-->>Srv: 4. Confirmation / Jeu de données (Resultset)
    
    Srv->>Srv: 5. Conversion en JSON
    
    Srv-->>App: 6. Réponse HTTP (Statut + JSON)
    Note left of Srv: Succès (200 OK) ou Erreur

    rect rgb(240, 240, 240)
        Note over App, BDD: Les échanges entre Android et Apache sont sécurisés via HTTPS
    end
----

**Mission 4 : Cybersécurité et accompagnement de la transformation numérique**

**4.1 : Analyse de risques et DICP**

**Question 4.1.1 :**

Les deux risques majeurs pesant sur la base de données de Restiloc sont : 
1) un utilisateur malveillant peut supprimer/modifier des données dans la base (**Intégrité**). La solutiopn est de faire un paramétrage des requêtes (PDO)
2) un utilisateur malveillant peut intercepter les identifiants de connexion ou les informations sensibles des véhicules (Confidentialité). Sans tunnel sécurisé, la Preuve de l'identité de l'émetteur est également compromise.

**Question 4.1.2 :**

D'après le DICP, le critère qui est principalement visé par la présence de cette photo est la **Preuve (Traçabilité)**

**Justification :**

il faut pouvoir prouver la réalité du dommage ce qui implique donc un niveau de sécurité Maximum

**4.2 : Protection des données à caractère personnel (RGPD)**

**Question 4.2.1 :**

1) Le hashage permet une sécurité car on ne peut pas retrouver un mot de passe à partir d'un hash (il est unique et irréversible).
2) Un des algorithme de hashage robuste recommandé par l'ANSSI est le SHA-256

**4.3 : Sécurité applicative et SQL**

**Question 4.3.1 :**

1) D'après le document 6, la ligne concernée est la ligne $sql .= " WHERE idExpert = ".$id;

Le code utilise la concaténation directe d'une variable provenant de l'URL ($id = $_GET['idExpert']) dans la requête SQL. Un utilisateur malveillant peut modifier la valeur de idExpert dans l'URL pour injecter des commandes SQL.

2) Voici une réecriture sécurisée de la partie SQL en utilisant une requête préparée avec PDO :

````sql
// Préparation de la requête avec un marqueur '?'
$sql = "SELECT idMission, heureDebut, ville, V.immatriculation AS immatriculation, marque, modele
        FROM MissionExpertise M
        JOIN Garage G ON M.idGarage = G.idGarage
        JOIN VehiculeExpertise V ON M.idMission = V.idMission
        WHERE idExpert = ? 
        AND dateMission = ?
        ORDER BY heureDebut ASC";

$reponse = $bdd->prepare($sql);
// Exécution en passant les variables dans un tableau
$reponse->execute([$id, DATE("Y-m-d")]);
$resultat = $reponse->fetchAll(PDO::FETCH_ASSOC);
````

**Question 4.3.2 :**

La faille IDOR (référence directe non sécurisée à un objet) se produit lorsque l'application expose une référence à un objet interne (ici, l'identifiant de l'expert idExpert) via une URL, sans vérifier si l'utilisateur qui effectue la requête possède les droits nécessaires pour accéder à cet objet.

**Solution pour corriger cette faille :**
Pour corriger ce problème, il ne faut plus passer l'ID de l'expert en paramètre GET. Le serveur doit récupérer l'identité de l'expert via une variable de session sécurisée établie lors de la connexion (login), garantissant que l'expert ne peut voir que ses propres missions.

Mécanisme d'abus par un expert malveillant (Faille IDOR) :

Un expert malveillant peut exploiter cette vulnérabilité via une technique de "prévisibilité des identifiants" ou de "manipulation de paramètres" selon les étapes suivantes :

1) Changement d'identifiant : Supposons qu'un expert possède l'ID 5. Il lui suffit de modifier manuellement le paramètre dans l'URL (via un navigateur ou un outil d'interception de requêtes comme Burp Suite) en remplaçant idExpert=5 par idExpert=1, idExpert=2, idExpert=3, etc.

2) Accès aux données tierces : Comme le script PHP côté serveur (Document 6) ne vérifie pas si l'expert qui demande les missions est bien celui qui est authentifié, le serveur renverra fidèlement la liste des missions de n'importe quel autre expert.

3) Conséquences : L'expert malveillant peut ainsi espionner l'emploi du temps de ses collègues, connaître les adresses des clients à visiter et accéder à des informations sur des véhicules qui ne lui ont pas été attribués, violant ainsi le critère de Confidentialité du DICP.

**Question 4.4 : Intégrité des données et audit (Déclencheurs)**

Transact-SQL le déclencheur ( Trigger ) trig_audit_delete_mission :

````sql
/* Déclencheur pour auditer les suppressions dans la table MissionExpertise.
   Cible : SQL Server (Transact-SQL)
*/

CREATE TRIGGER trig_audit_delete_mission
ON MissionExpertise
AFTER DELETE
AS
BEGIN
    -- Désactive le message "X lignes affectées" pour les performances
    SET NOCOUNT ON;

    -- Insertion des données supprimées dans la table d'audit
    -- On utilise la table virtuelle 'deleted' fournie par SQL Server
    INSERT INTO AUDIT_SUPPRESSION (idMission, dateSuppression)
    SELECT idMission, GETDATE()
    FROM deleted;
END;
GO
````
**Structure de la table d'audit :**
````sql
CREATE TABLE AUDIT_SUPPRESSION (
    idAudit INT PRIMARY KEY IDENTITY(1,1),
    idMission INT,
    dateSuppression DATETIME
);
````

**Cas Restiloc : Services Web et Audit de Sécurité**

Quelle modélisation de base de données avez-vous choisi pour différencier les prestations "Peinture" et "Pièce" ?

**j'ai choisi la modélisation du schéma relationnel pour différencier les prestations "Peinture" et "Pièce"**

Justifiez l'utilisation d'une classe abstraite pour la classe Expertisedans le diagramme de classes.

**Utiliser une classe abstraite permet de définir une identité commune et d'imposer des règles à d'autres classes**

Expliquez l'architecture applicative permettant l'échange de données entre le SGBD, le serveur PHP et le client JavaFX.

****

Pourquoi la présence d'un identifiant en clair dans l'URL d'une API constitue-t-elle une vulnérabilité de type IDOR ?

**La présence d'un identifiant en clair dans l'URL d'une API constitue une vulnérabilité car elle peut être simple à deviner mais avant tout il y a une absence de contrôle d'autorisation**

En quoi l'utilisation de HTTPS est-elle indispensable même si l'application nécessite une authentification ?

**L'utilisation de HTTPS est inispensable même si l'application nécessite une authentification car le HTTPS crée un tunnel blindé pour que personne ne voie ce que tu fais ou ne vole tes preuves d'identité pendant le trajet.**

Expliquez la différence entre une donnée à caractère personnel et une donnée sensible selon les critères du RGPD.

Pourquoi le hachage des mots de passe est-il techniquement préférable à leur chiffrement ?

Quel critère du DICP est principalement visé par l'archivage obligatoire d'une photo pour chaque prestation ?

Expliquez le fonctionnement du déclenchement trig_audit_delete_missionpour assurer la traçabilité des suppressions.

Comment la classe RestiClienttransforme-t-elle un flux JSON reçu par l'API en une liste d'objets Mission?

