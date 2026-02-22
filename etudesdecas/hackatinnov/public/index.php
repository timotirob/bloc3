<?php
require_once '../vendor/autoload.php';

use HackatInnov\Initiation;
use HackatInnov\Membre;

$anim = new Membre("Friche", "Morgan", "m@mail.com", "0600000000");
$init = new Initiation(1, "PHP", new DateTime(), 120, 2, "Turing", $anim, "Pro");

$p1 = new Membre("Dupont", "Jean", "j@m.fr", "01");
$init->ajouterParticipant($p1);

echo $init->toJson();