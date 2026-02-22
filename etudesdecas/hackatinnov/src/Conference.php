<?php
declare(strict_types=1);

namespace HackatInnov;

use DateTime;

class Conference extends Evenement {
    public function __construct(
        int $id,
        string $libelle,
        DateTime $date,
        int $duree,
        int $nbPlaces,
        private string $theme
    ) {
        // On utilise les valeurs par défaut du parent pour salle, animateur et public
        parent::__construct($id, $libelle, $date, $duree, $nbPlaces);
    }

    public function getType(): string {
        return "Conférence";
    }

    public function getTheme(): string {
        return $this->theme;
    }
}