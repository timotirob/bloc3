<?php
declare(strict_types=1);

use PHPUnit\Framework\TestCase;
use HackatInnov\Initiation;
use HackatInnov\Membre;

/**
 * Classe de test pour valider les règles métier du module Hackat'Event
 * Basé sur les spécifications du Document 6
 */
class InitiationTest extends TestCase
{
    /**
     * Test de la méthode ajouterParticipant avec dépassement de quota
     * Vérifie la gestion des places disponibles (Réf: Document 6)
     */
    public function testAjouterParticipantCapacite(): void
    {
        // 1. Préparation des données (Mocking simple d'un animateur)
        $animateur = new Membre("Friche", "Morgan", "mfriche@mail.com", "0601020304");
        $date = new \DateTime("2021-06-19 13:00:00");

        // 2. Instanciation d'une initiation limitée à 1 seule place
        $initiation = new Initiation(1, "Intro PHP", $date, 120, 1, "Alan Turing", $animateur, "Débutants");

        $p1 = new Membre("Dupont", "Jean", "jdupont@mail.com", "0102030405");
        $p2 = new Membre("Durand", "Marie", "mdurand@mail.com", "0504030201");

        // 3. Exécution et Assertions
        // Le premier ajout doit être accepté (True)
        $this->assertTrue($initiation->ajouterParticipant($p1));

        // Le second ajout doit être refusé (False) car nbPlaces = 1
        $this->assertFalse($initiation->ajouterParticipant($p2));

        // On vérifie que la collection interne ne contient bien qu'un seul membre
        $this->assertCount(1, $initiation->getLesMembresParticipants());
    }
}
