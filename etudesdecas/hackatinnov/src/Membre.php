<?php
declare(strict_types=1);

namespace HackatInnov;

/**
 * Représente un membre (Participant ou Animateur)
 * Conforme aux spécifications du Document 1 et 4 [cite: 21, 363]
 */
class Membre {
    /**
     * Constructeur utilisant la promotion de propriétés (PHP 8+)
     */
    public function __construct(
        private string $nom,
        private string $prenom,
        private string $mel,
        private string $telephone
    ) {}

    public function getNom(): string {
        return strtoupper($this->nom);
    }

    public function getPrenom(): string {
        return ucfirst($this->prenom);
    }

    public function getMel(): string {
        return $this->mel;
    }

    public function getTelephone(): string {
        return $this->telephone;
    }

    /**
     * Sérialisation au format JSON pour l'interface mobile [cite: 145]
     */
    public function toJson(): string {
        return json_encode([
            'nom'       => $this->getNom(),
            'prenom'    => $this->getPrenom(),
            'mel'       => $this->mel,
            'telephone' => $this->telephone
        ], JSON_THROW_ON_ERROR);
    }
}