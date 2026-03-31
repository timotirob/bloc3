## **TP Étude de Cas : Hackat'Innov**

**Dossier A – Gestion des participants**

**Mission A.1 – Évolution de la base de données pour la gestion des hackathons**

**Question A.1 :**

## Schéma relationnel

**ORGANISATEUR** (id, statut, nom, siteWeb, mel)
- Clé primaire : id

**MEMBRE** (id, nom, prenom, mel, téléphone)
- Clé primaire : id

**HACKATHON** (id, dateHeureDebut, dateHeureFin, lieu, ville, theme, affiche, objectifs)
- Clé primaire : id

**ORGANISER** (idHackathon, idOrganisateur)
- Clé primaire : (idHackathon, idOrganisateur)
- Clés étrangères : idHackathon référence HACKATHON(id), idOrganisateur référence ORGANISATEUR(id)

**COMPOSITEUR** (idHackathon, idMembreJury)
- Clé primaire : (idHackathon, idMembreJury)
- Clés étrangères : idHackathon référence HACKATHON(id), idMembreJury référence MEMBRE(id)

**PROJET** (id, description, retenu, idHackathon)
- Clé primaire : id
- Clé étrangère : idHackathon référence HACKATHON(id)

**EQUIPE** (id, nom, idProjet)
- Clé primaire : id
- Clé étrangère : idProjet référence PROJET(id)

**EVENEMENT** (idHackathon, idMembre, idEquipe, dateInscription)
- Clé primaire : (idHackathon, idMembre)
- Clés étrangères : idHackathon référence HACKATHON(id), idMembre référence MEMBRE(id), idEquipe référence EQUIPE(id) (nullable)

**VOTE** (idMembreJury, idEquipe, nbPoints)
- Clé primaire : (idMembreJury, idEquipe)
- Clés étrangères : idMembreJury référence MEMBRE(id), idEquipe référence EQUIPE(id)

**Mission A.2 – Édition du planning des phases d’un hackathon**

**Question A.2 :**

A.2.1. 1 Hackathon est associé à 1 seule heure de début, on justifie cela par la clé primaire du couple : idHackathon, dateHeureDebut. = 1 Hackathon → 1 heure de début

A.2.2. Requête de la création de la table PLANNING en respectant les types de données et les contraintes d’intégrité référentielle 
````sql
create table Planning (

idHackathon INT NOT NULL, 

dateHeureDebut DATETIME NOT NULL, 

idPhase INT NOT NULL,

duree INT, 

CONSTRAINT PK_PLANNING PRIMARY KEY (idHackathon, dateHeureDebut), 

CONSTRAINT FK_PLANNING_HACKATHON FOREIGN KEY (idHackathon) REFERENCES HACKATHON(id) ON DELETE CASCADE, 

CONSTRAINT FK_PLANNING_PHASE FOREIGN KEY (idPhase) REFERENCES PHASE(id) ON DELETE RESTRICT
)
````
**Mission A.3 – Consultation du planning par participant**

**Questions A.3 :**

Question A.3.1 : le choix de la "date et heure de début" comme clé du dictionnaire est pertinent pour garantir l’unicité des activités affichées dans le planning d’un participant pour une garantie de l’unicité technique des entrées dans le dictionnaire, empêchant tout doublon d’activités pour un même créneau horaire. Il permet ainsi d’assurer une cohérence métier et une facilité du tri chronologique automatique du planning du participant .

Question A.3.2 : Algorithme permettant de remplir ce dictionnaire à partir des données de l’objet Hackathon et des inscriptions du Membre : 
````php
// Initialisation du dictionnaire
planningParParticipant <- Nouveau Tableau Associatif()
// 1. Parcours des événements du hackathon
Pour chaque unEvt dans unHackathon.lesEvenements faire    
    // Si c'est une Initiation (conformément à l'image 7ad2df)
    Si unEvt est de type Initiation alors
        
        // On vérifie si le membre est inscrit à cette initiation
        Pour chaque unMembre dans unEvt.getLesMembresParticipants() faire
            Si unMembre.getMel() == leMelMembre alors
                // On ajoute l'initiation au planning avec sa date comme clé
                dateClé <- unEvt.getDateHeure()
                planningParParticipant[dateClé] <- unEvt.getLibelle()
            Fin Si
        Fin Pour
    // Si c'est une Conférence (ou autre phase générale du hackathon)
    Sinon
        dateClé <- unEvt.getDateHeure()
        planningParParticipant[dateClé] <- unEvt.getLibelle()
    Fin Si
Fin Pour
Retourner planningParParticipant
````
**Mission A.4 – Mise en place de déclencheurs (Triggers)**

1. Contrôle de capacité
````sql
DELIMITER //

CREATE TRIGGER tg_check_capacite
BEFORE INSERT ON EVENEMENT
FOR EACH ROW
BEGIN
    DECLARE v_capacité INT;
    DECLARE v_inscrits INT;

    -- Récupération de la capacité max du hackathon
    SELECT nbPlaces INTO v_capacité 
    FROM HACKATHON 
    WHERE id = NEW.idHackathon;

    -- Comptage du nombre d'inscrits actuels
    SELECT COUNT(*) INTO v_inscrits 
    FROM EVENEMENT 
    WHERE idHackathon = NEW.idHackathon;

    -- Si complet, on bloque l'insertion avec un message d'erreur
    IF v_inscrits >= v_capacité THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Erreur : Capacité maximale du Hackathon atteinte.';
    END IF;
END //
DELIMITER ;
````
2. Création de la table "LOG_VOTES" :
````sql
CREATE TABLE LOG_VOTES (
    idAudit INT AUTO_INCREMENT PRIMARY KEY,
    idMembreJury INT,
    idEquipe INT,
    ancienneNote INT,
    nouvelleNote INT,
    dateAction DATETIME DEFAULT CURRENT_TIMESTAMP,
    typeAction VARCHAR(10), -- 'UPDATE' ou 'DELETE'
    utilisateur VARCHAR(50)
);
````
3. Création déclencheur : 
````sql
DELIMITER //

-- Audit sur la modification (Update)
CREATE TRIGGER tg_audit_vote_update
AFTER UPDATE ON VOTE
FOR EACH ROW
BEGIN
    INSERT INTO LOG_VOTES (idMembreJury, idEquipe, ancienneNote, nouvelleNote, typeAction, utilisateur)
    VALUES (OLD.idMembreJury, OLD.idEquipe, OLD.nbPoints, NEW.nbPoints, 'UPDATE', USER());
END //

-- Audit sur la suppression (Delete)
CREATE TRIGGER tg_audit_vote_delete
AFTER DELETE ON VOTE
FOR EACH ROW
BEGIN
    INSERT INTO LOG_VOTES (idMembreJury, idEquipe, ancienneNote, nouvelleNote, typeAction, utilisateur)
    VALUES (OLD.idMembreJury, OLD.idEquipe, OLD.nbPoints, NULL, 'DELETE', USER());
END //

DELIMITER ;
````

**Dossier B  – Gestion d’évènements organisés autour des hackathons**

**Question B.1 – Corrections des erreurs signalées :**

1) Ancienne version de la méthode ajouterMateriel :
````java
 public function ajouterMateriel($unLibelleMateriel, $uneQuantite) {
        // Question B.1 a) :  à corriger et à reporter sur votre copie
        if ($unLibelleMateriel != null ) {
            if (array_key_exists($unLibelleMateriel, $this->lesMateriels) == false) {
                // on vérifie que la clé n'existe pas déjà dans le dictionnaire
                $this->lesMateriels[$unLibelleMateriel] = $uneQuantite;
                /* ajoute dans le dictionnaire la clé de type String correspondant au libelleMateriel et la
                   valeur de type entier correspondant à la quantité demandée*/
            }
        }
    }

````
Version corrigée de la méthode ajouterMateriel :
````java
public function ajouterMateriel($unLibelleMateriel, $uneQuantite) {
    if ($unLibelleMateriel != null) {
        if (array_key_exists($unLibelleMateriel, $this->lesMateriels)) {
            // Si le matériel existe, on cumule la quantité
            $this->lesMateriels[$unLibelleMateriel] += $uneQuantite;
        } else {
            // Sinon, on crée l'entrée
            $this->lesMateriels[$unLibelleMateriel] = $uneQuantite;
        }
    }
}
````
2) Constructeur de la classe Initiation :
````java
public function __construct($libelle, $dateHeure, $duree, $salle, $lAnimateur, $leTypePublic, $nb)
 {
    parent::__construct($libelle, $dateHeure, $duree, $salle, $lAnimateur, $leTypePublic);
    $this->nbPlaces = $nb;
    $this->lesMateriels = array();
    $this->lesMembresParticipants = array();
}
````
3) Méthode ajouterParticipant :
````java
public function ajouterParticipant($unMembre) {
    if (count($this->lesMembresParticipants) < $this->nbPlaces) {
        $this->lesMembresParticipants[] = $unMembre;
        return true;
    }
    return false;
}

````
4) Méthode lesParticipantstoJson :
````java
private function lesParticipantstoJson() {
    $chaineJson = ' "lesParticipants" : [ ';
    $debutChaine = true;

    foreach ($this->lesMembresParticipants as $unMembre) {
        if ($debutChaine == false) {
            $chaineJson = $chaineJson . ", \n"; // Ajout de la virgule entre les membres
        } else {
            $debutChaine = false;
        }
        // Appel de la méthode toJson() de l'objet Membre
        $chaineJson = $chaineJson . $unMembre->toJson();
    }

    return $chaineJson . " ] ";
}

````
5) Métode toJson :
````java
public function toJson() {
    // 1. Récupération des attributs de la classe parente (Evenement)
    // On retire l'accolade fermante du parent pour pouvoir ajouter les nouveaux champs
    $jsonParent = parent::toJson();
    $jsonBase = substr($jsonParent, 0, -3); // Enlève " \n }"

    // 2. Construction de la chaîne finale
    $chaineJson = $jsonBase . ", \n";
    $chaineJson .= ' "nbPlaces" : ' . $this->nbPlaces . ", \n";
    
    // 3. Appel des méthodes de conversion des collections
    $chaineJson .= $this->lesMaterielsToJson() . ", \n";
    $chaineJson .= $this->lesParticipantsToJson();

    // 4. Fermeture de l'objet JSON
    $chaineJson .= "\n }";

    return $chaineJson;
}

```` 
**Question B.3 – Analyse des vulnérabilités et Cybersécurité (DICP)**

Question B.3.1. : 

D’après les attributs de la classe Membre, l’export de ces données vers une application publique constitue une faille de confidentialité et une violation du RGPD car n’importe quel utilisateur peut récupérer les coordonnées de tous les participants. (confidentialité) et les données doivent être collectées pour des finalités déterminées et ne pas être exposées au-delà du nécessaire (principe de minimisation), (RGPD).
Il faut donc retourner les données nécessaires en enlevant les données personnelles. Voici une solution algorithmique simple pour y remédier : 
````java
public function lesParticipantsToJson() {
    $participants = [];
    foreach ($this->lesParticipants as $membre) {
        $participants[] = [
            "nom"    => $membre->getNom(),
            "prenom" => $membre->getPrenom()
            // $mel et $telephone volontairement exclus
        ];
    }
    return json_encode($participants);
}
````

Question B.3.2 : 

Si un organisateur saisissait le libellé suivant pour une conférence (L’avenir de la “Blockchain”),  il y aurait une erreur dans le Parsing JSON (la réponse ne peut pas être désérialisée) / un crash de l'application ou affichage vide et plus généralement, un libellé malveillant pourrait injecter de fausses clés JSON et corrompre les données affichées

Question B.3.3 : 

La fonction native PHP json_encode() permet de générer un JSON valide et sécurisé en échappant automatiquement tous les caractères spéciaux (comme les guillemets "), évitant ainsi toute injection ou erreur de parsing. Elle est d'ailleurs déjà utilisée dans la classe Membre.

**Dossier C – Gestion des recherches pour le mobile**

**Question C.1 :**

Ce code PHP constitue une API de recherche qui récupère en toute sécurité un critère saisi par l'utilisateur (via POST), l'utilise dans une requête SQL préparée pour filtrer les hackathons correspondants en base de données, puis retourne les résultats au format JSON à l'application appelante.

**Question C.3 :**

a. Les LEFT OUTER JOIN permettent de conserver tous les événements de la table EVENEMENT, même ceux qui ne sont ni une initiation ni une conférence (ex: un événement sans sous-type). Sans eux, les événements sans correspondance seraient exclus des résultats.

b. Requête SQL complété avec la date, l’heure, la salle de l’évènement avec le nom et le prénom de l’animateur et qui sont triés chronologiquement : 
````sql
SELECT E.libelle, I.nbplaces, C.theme,
       E.dateHeureDebut AS date,
       E.salle,
       A.nom AS nomAnimateur,
       A.prenom AS prenomAnimateur
FROM EVENEMENT E
LEFT OUTER JOIN INITIATION I ON E.id = I.idEvenementInit
LEFT OUTER JOIN CONFERENCE C ON E.id = C.idEvenementConf
JOIN MEMBRE A ON E.idAnimateur = A.idMembre
ORDER BY E.dateHeureDebut ASC;
````
**Question C.4 :**

Création d’une vue en langage SQL permettant de retourner les identifiants de tous les évènements de type « initiation » avec, pour chacun, le nombre de membres inscrits : 
````sql
CREATE VIEW vue_succes_initiations AS
SELECT I.idEvenementInit AS idEvenement,
       COUNT(P.idMembre) AS nbInscrits
FROM INITIATION I
LEFT OUTER JOIN PARTICIPE P ON I.idEvenementInit = P.idEvenement
GROUP BY I.idEvenementInit;
````
**Question C.5 – Sécurisation de l’API Web (Cybersécurité / DICP)**

**Question C.5.1 :**

Confidentialité : Un attaquant peut extraire toute la base de données

Intégrité : Il peut modifier ou supprimer des données (DROP TABLE, UPDATE...)

Disponibilité : Il peut détruire la base et rendre l'application inaccessible

**Question C.5.2 :**

````php
// ✅ Récupération sécurisée du critère
$critere = filter_input(INPUT_GET, 'recherche', FILTER_SANITIZE_STRING);

// ✅ Requête préparée avec marqueur nommé
$sql = "SELECT id, dateHeureDebut, ville, theme 
        FROM HACKATHON 
        WHERE ville = :critere";

$stmt = $pdo->prepare($sql);

// ✅ Liaison sécurisée de la valeur
$stmt->bindValue(':critere', $critere, PDO::PARAM_STR);

$stmt->execute();

$resultat = $stmt->fetchAll(PDO::FETCH_ASSOC);

````
**Dossier D – Gestion des votes et de l’infrastructure**

**
Question D.1 – Conséquence d'utilisation malveillante

Un membre du jury pourrait voter pour des projets d'un hackathon où il est aussi participant, faussant ainsi les résultats en favorisant ses concurrents directs ou en s'avantageant lui-même. Cela constitue un conflit d'intérêts pouvant compromettre l'équité de tout le concours.

Question D.2 : 

Les intérêts de mettre le serveur de bases de données en dehors de la zone démilitarisée (DMZ) pour aider Mme Mabille à compléter son étude est un point majeur de ne jamais l’exposer directement à Internet et même si un attaquant compromet le serveur web, il ne peut pas accéder directement aux données sensibles des participants, ce qui applique le principe de défense en profondeur.

**
**Question D.3 :**
| Mesure de sécurité                          | Composants concernés                                     |
|----------------------------------------------|----------------------------------------------------------|
| 1. Sécuriser le service HTTP (HTTPS)         | Serveur Apache (DMZ) + Client Android                    |
| 2. Utiliser des requêtes préparées           | API PHP (DMZ)                                            |
| 3. Se prémunir des injections SQL            | API PHP (DMZ) + Serveur MySQL (zone privée)              |
| 4. Se connecter via un réseau Wi-Fi sécurisé | Client Android (zone publique)                           |
| 5. Préserver l'intégrité des données (droits d'accès) | Serveur MySQL (zone privée)                    |
| 6. Mise à jour des bibliothèques et composants logiciels | Serveur Apache + API PHP (DMZ) + Serveur MySQL (zone privée) |



# Cas Hackat'Innov : Web Dynamique et Intégrité SQL

1. **Justifiez l'utilisation d'une jointure de type `LEFT JOIN` pour lister l'ensemble des événements satellites.**  
   La jointure `LEFT JOIN` permet de lister tous les événements satellites, même ceux qui n'ont pas encore d'inscription ou de participation associée. Contrairement à un `INNER JOIN` qui ne retournerait que les événements possédant des correspondances dans la table jointe, le `LEFT JOIN` conserve l'intégralité des événements de la table de gauche (ici les événements satellites) et associe les données disponibles de la table de droite. Cela garantit qu'aucun événement n'est exclu du listing, ce qui est essentiel pour une vue d'ensemble exhaustive.

2. **Pourquoi le choix de la date et l'heure comme clé d'un dictionnaire est-il pertinent pour le planning d'un participant ?**  
   Utiliser la date et l'heure comme clé d'un dictionnaire permet d'organiser le planning de manière chronologique et d'assurer un accès direct aux créneaux horaires. Cette structure garantit l'unicité de chaque créneau pour un participant donné (un participant ne peut être à deux endroits à la fois) et facilite les vérifications de chevauchement. De plus, l'accès par clé offre une complexité théorique O(1), ce qui est performant pour consulter ou modifier un créneau spécifique.

3. **Expliquez comment le déclencheur `tg_check_capacite` garantit que la limite de places d'un hackathon est respectée.**  
   Le déclencheur `tg_check_capacite` est un trigger SQL activé avant l'insertion d'une nouvelle inscription. Il vérifie, en comptant le nombre d'inscriptions déjà enregistrées pour le hackathon concerné, que la capacité maximale définie n'est pas atteinte. Si la limite est déjà atteinte ou dépassée, le déclencheur lève une exception et annule l'insertion, empêchant ainsi toute inscription supplémentaire. Cela garantit l'intégrité des données au niveau de la base de données, indépendamment de la couche applicative.

4. **En quoi l'export des données personnelles des membres vers une application publique constitue-t-il une violation du RGPD ?**  
   Le RGPD (Règlement Général sur la Protection des Données) impose que les données personnelles soient traitées de manière licite, loyale et transparente, avec des garanties de sécurité appropriées. Exporter des données personnelles vers une application publique sans consentement explicite des personnes concernées, sans contrôle d'accès et sans mesure de sécurité constitue plusieurs violations : absence de base légale, défaut de minimisation des données, absence de mesure de sécurité (chiffrement, contrôle d'accès), et risque de fuite de données. Cela expose l'organisation à des sanctions administratives et à des recours juridiques de la part des personnes concernées.

5. **Démontrez l'impact d'une saisie utilisateur contenant des guillemets sur une chaîne JSON construite manuellement.**  
   Si un utilisateur saisit une chaîne contenant des guillemets, par exemple `"John "The Hacker" Doe"`, et que cette valeur est insérée manuellement par concaténation dans une chaîne JSON, le résultat sera :
   ```json
   {"nom": "John "The Hacker" Doe"}

6. **Pourquoi la fonction native `json_encode` est-elle préférable à une construction de flux par concaténation ?**  
   La fonction native `json_encode` est préférable pour plusieurs raisons :
   - **Échappement automatique des caractères spéciaux** : elle gère correctement les guillemets, antislashs, retours à la ligne et caractères Unicode, produisant systématiquement une chaîne JSON valide.
   - **Gestion native des types de données** : elle convertit automatiquement les tableaux, objets, booléens, entiers et valeurs null en leur représentation JSON appropriée, sans risque d'erreur de syntaxe.
   - **Prévention des injections JSON** : en échappant rigoureusement les valeurs, elle empêche un utilisateur malveillant d'injecter du contenu qui pourrait briser la structure JSON ou introduire des comportements inattendus.
   - **Lisibilité et maintenabilité** : le code est plus concis, moins sujet aux erreurs et plus facile à faire évoluer qu'une concaténation manuelle fastidieuse.
   - **Respect des standards** : elle garantit la conformité avec la spécification JSON (RFC 7159), contrairement à une construction artisanale qui peut omettre des règles essentielles.

7. **Quel est l'intérêt d'utiliser des transactions SQL lors de l'ajout d'un événement dans les tables mère et fille ?**  
   L'utilisation des transactions SQL est cruciale pour garantir l'intégrité des données dans un scénario d'ajout multi-tables :
   - **Atomicité** : l'insertion dans la table mère (ex: `HACKATHON`) et dans les tables filles (ex: `ORGANISER`, `COMPOSITEUR`) est traitée comme une seule unité atomique. Si une opération échoue, l'ensemble est annulé par `ROLLBACK`, évitant les données orphelines.
   - **Cohérence référentielle** : on s'assure qu'il n'existe pas d'enregistrement dans une table fille sans correspondance valide dans la table mère.
   - **Isolation** : les transactions isolent les opérations des autres utilisateurs simultanés, empêchant la lecture d'états intermédiaires incohérents.
   - **Pérennité** : une fois validée (`COMMIT`), l'opération est durable même en cas de panne système.
   - **Gestion des erreurs** : permet d'implémenter une logique de reprise cohérente en cas d'exception.

8. **Expliquez comment le mécanisme des requêtes préparées avec PDO neutralise physiquement une injection SQL.**  
   Les requêtes préparées avec PDO neutralisent les injections SQL par une séparation stricte entre le code SQL et les données :
   - **Phase 1 - Préparation** : la requête contenant des marqueurs (paramètres nommés `:nom` ou positionnels `?`) est envoyée au moteur SQL. Celui-ci analyse, valide et compile le plan d'exécution sans connaître les valeurs.
   - **Phase 2 - Exécution avec liaison** : les données utilisateur sont transmises séparément via `bindParam()` ou `execute()`. Ces valeurs sont traitées comme des données brutes, jamais interprétées comme du code SQL.
   
   **Conséquence physique** : même si un utilisateur saisit une chaîne malveillante comme `' OR 1=1; DROP TABLE membres; --`, celle-ci est automatiquement échappée et passée comme valeur littérale. Le moteur SQL l'interprète comme une simple chaîne de caractères et non comme des instructions exécutables. Cette approche élimine la possibilité d'injection SQL quelle que soit la nature de la donnée fournie.

9. **Quel est l'intérêt de placer le serveur de bases de données dans une zone privée, séparée de la DMZ ?**  
   Cette architecture en zones distinctes répond à des exigences fondamentales de sécurité :
   - **Principe de défense en profondeur** : la base de données n'est pas exposée directement sur Internet. Un attaquant doit d'abord compromettre un serveur de la DMZ avant de pouvoir tenter d'accéder aux données.
   - **Réduction de la surface d'attaque** : seuls les ports nécessaires aux échanges avec les serveurs applicatifs (généralement le port 3306 pour MySQL) sont ouverts entre les zones.
   - **Limitation de l'impact en cas de compromission** : même si un serveur web est piraté, les données critiques restent protégées par une barrière supplémentaire (pare-feu, ACL, authentification renforcée).
   - **Conformité réglementaire** : de nombreux standards (PCI-DSS, RGPD, ISO 27001) imposent la segmentation des systèmes traitant des données sensibles.
   - **Contrôle des accès facilité** : permet de définir des politiques de sécurité distinctes et plus restrictives pour la zone privée (chiffrement au repos, authentification forte, journalisation renforcée).

10. **Décrivez la méthodologie TDD (Test Driven Development) utilisée pour corriger les erreurs de la classe `Initiation`.**  
    Le TDD est une approche de développement itérative basée sur le cycle **Red-Green-Refactor** :
    
    **1. Red (Rouge - Échec)** :
    - Rédaction d'un test unitaire qui reproduit spécifiquement le comportement erroné de la classe `Initiation`.
    - Exécution du test : il échoue (rouge), confirmant que l'erreur est bien identifiée et que le test est valide.
    - Ce test sert de spécification exécutable de la correction attendue.
    
    **2. Green (Vert - Succès)** :
    - Correction du code de la classe `Initiation` en se concentrant uniquement sur le test en échec.
    - Exécution du test : il passe (vert), prouvant que l'erreur a été corrigée.
    - À ce stade, on n'optimise pas, on se contente de faire passer le test.
    
    **3. Refactor (Refactorisation)** :
    - Nettoyage du code : suppression des redondances, amélioration de la lisibilité, respect des conventions de nommage, extraction de méthodes si nécessaire.
    - Réexécution de l'ensemble des tests (non régressifs) pour garantir que les modifications n'ont pas introduit de nouveaux bugs.
    
    **Avantages appliqués à la correction des erreurs** :
    - **Traçabilité** : chaque correction est associée à un test automatisé.
    - **Non-régression** : les tests empêchent la réapparition des erreurs lors d'évolutions futures.
    - **Couverture** : l'ensemble du comportement attendu de la classe `Initiation` est documenté et validé.
    - **Confiance** : permet de refactoriser sereinement le code sans crainte de casser des fonctionnalités existantes.
