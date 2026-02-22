-- ============================================================
-- STRUCTURE DE LA BASE DE DONNÉES
-- ============================================================

DROP DATABASE IF EXISTS hackat_innov;
CREATE DATABASE hackat_innov CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hackat_innov;

-- Table Hackathon
CREATE TABLE HACKATHON (
                           id INT PRIMARY KEY AUTO_INCREMENT,
                           theme VARCHAR(255) NOT NULL,
                           ville VARCHAR(100),
                           dateHeureDebut DATETIME,
                           nbPlaces INT NOT NULL
) ENGINE=InnoDB;

-- Table Equipe
CREATE TABLE EQUIPE (
                        idEquipe INT PRIMARY KEY AUTO_INCREMENT,
                        nomEquipe VARCHAR(100) NOT NULL,
                        idHackathon INT NOT NULL,
                        CONSTRAINT fk_equipe_hackathon FOREIGN KEY (idHackathon) REFERENCES HACKATHON(id)
) ENGINE=InnoDB;

-- Table Participant
CREATE TABLE PARTICIPANT (
                             idPart INT PRIMARY KEY AUTO_INCREMENT,
                             nom VARCHAR(50) NOT NULL,
                             prenom VARCHAR(50),
                             email VARCHAR(100) UNIQUE,
                             idEquipe INT NOT NULL,
                             CONSTRAINT fk_participant_equipe FOREIGN KEY (idEquipe) REFERENCES EQUIPE(idEquipe)
) ENGINE=InnoDB;

-- Table de Log pour la Cybersécurité (DICP - Preuve)
CREATE TABLE LOG_INSCRIPTIONS (
                                  idLog INT PRIMARY KEY AUTO_INCREMENT,
                                  message VARCHAR(255),
                                  dateLog DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- DÉCLENCHEURS (TRIGGERS)
-- ============================================================

DELIMITER //

-- Trigger pour contrôler la capacité maximale
CREATE TRIGGER tg_check_capacite
    BEFORE INSERT ON PARTICIPANT
    FOR EACH ROW
BEGIN
    DECLARE v_max INT;
    DECLARE v_actuel INT;
    DECLARE v_idH INT;

    -- Trouver le hackathon lié à l'équipe
    SELECT idHackathon INTO v_idH FROM EQUIPE WHERE idEquipe = NEW.idEquipe;

    -- Capacité max
    SELECT nbPlaces INTO v_max FROM HACKATHON WHERE id = v_idH;

    -- Nombre d'inscrits actuels via toutes les équipes du même hackathon
    SELECT COUNT(*) INTO v_actuel
    FROM PARTICIPANT p
             JOIN EQUIPE e ON p.idEquipe = e.idEquipe
    WHERE e.idHackathon = v_idH;

    IF v_actuel >= v_max THEN
        INSERT INTO LOG_INSCRIPTIONS (message) VALUES (CONCAT('Tentative échouée : Hackathon ', v_idH, ' complet'));
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Erreur : Capacité maximale atteinte pour ce hackathon.';
END IF;
END //

DELIMITER ;

-- ============================================================
-- JEU DE DONNÉES DE TEST (DML)
-- ============================================================

-- 1. Création d'un hackathon avec seulement 2 PLACES
INSERT INTO HACKATHON (theme, ville, dateHeureDebut, nbPlaces)
VALUES ('IA et Santé', 'Paris', '2026-06-12 09:00:00', 2);

-- 2. Création d'une équipe
INSERT INTO EQUIPE (nomEquipe, idHackathon) VALUES ('Team Alpha', 1);

-- 3. Inscription du 1er participant (Succès)
INSERT INTO PARTICIPANT (nom, prenom, email, idEquipe)
VALUES ('Dupont', 'Jean', 'jean.dupont@test.com', 1);

-- 4. Inscription du 2ème participant (Succès - On atteint la limite)
INSERT INTO PARTICIPANT (nom, prenom, email, idEquipe)
VALUES ('Durand', 'Marie', 'marie.durand@test.com', 1);

-- 5. Inscription du 3ème participant (DOIT ÉCHOUER via le trigger)
-- INSERT INTO PARTICIPANT (nom, prenom, email, idEquipe)
-- VALUES ('Petit', 'Pierre', 'pierre.petit@test.com', 1);

-- ============================================================
-- REQUÊTE DE VÉRIFICATION
-- ============================================================
SELECT h.theme, h.nbPlaces, COUNT(p.idPart) as inscrits
FROM HACKATHON h
         LEFT JOIN EQUIPE e ON h.id = e.idHackathon
         LEFT JOIN PARTICIPANT p ON e.idEquipe = p.idEquipe
GROUP BY h.id;