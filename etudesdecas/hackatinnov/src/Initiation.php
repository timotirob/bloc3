<?php
declare(strict_types=1);

namespace HackatInnov;

use DateTime;

class Initiation extends Evenement {
    private array $lesParticipants = [];

    public function __construct(
        int $id,
        string $lib,
        DateTime $dt,
        int $dur,
        int $nb,
        string $sal,
        Membre $anim,
        string $pub
    ) {
        // La signature correspond exactement à celle de Evenement.php
        parent::__construct($id, $lib, $dt, $dur, $nb, $sal, $anim, $pub);
    }

    public function ajouterParticipant(Membre $unMembre): bool {
        if (count($this->lesParticipants) < $this->nbPlaces) {
            $this->lesParticipants[] = $unMembre;
            return true;
        }
        return false;
    }

    public function getType(): string {
        return "Initiation";
    }

    /**
     * Retourne la collection des participants inscrits
     * Nécessaire pour les tests unitaires
     * @return Membre[]
     */
    public function getLesMembresParticipants(): array
    {
        return $this->lesParticipants;
    }

    public function toJson(): string {
        return json_encode([
            'id' => $this->id,
            'libelle' => $this->libelle,
            'date' => $this->dateHeure->format('Y-m-d H:i'),
            'animateur' => $this->animateur ? $this->animateur->getNom() : 'Inconnu',
            'places_libres' => $this->restePlaces(count($this->lesParticipants))
        ], JSON_THROW_ON_ERROR);
    }
}
