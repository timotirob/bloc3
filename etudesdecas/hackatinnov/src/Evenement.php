<?php
declare(strict_types=1);

namespace HackatInnov;

use DateTime;

abstract class Evenement {
    public function __construct(
        protected int $id,
        protected string $libelle,
        protected DateTime $dateHeure,
        protected int $duree,
        protected int $nbPlaces,
        protected string $salle = "",
        protected ?Membre $animateur = null,
        protected string $typePublic = ""
    ) {}

    abstract public function getType(): string;

    public function restePlaces(int $nbInscrits): int {
        return $this->nbPlaces - $nbInscrits;
    }
}