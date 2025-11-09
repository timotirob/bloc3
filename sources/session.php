<?php
session_start();

if (isset($_GET['nom']) || isset($_SESSION['nom'])){
    $nom = (isset($_GET['nom'])) ? $_GET['nom'] : $_SESSION['nom'] ;
 echo "bonjour $nom <BR>" ;
 echo "<a href='supprime.php'> Cliquez ici pour supprimer la session </a>" ;
    $_SESSION['nom'] = $nom ;
}

else {
    echo "bonjour gentil inconnu <BR>" ;
}

