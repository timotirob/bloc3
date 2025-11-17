import crypto from 'crypto';

/**
 * Génération du grain de sel en utilisant la fonction
 * randomBytes du module crypto.
 * @param {number} longueur - Longueur de la chaîne aléatoire souhaitée.
 */
export const genereChaineAleatoire = (longueur = 64) => {
    return crypto.randomBytes(Math.ceil(longueur / 2))
        .toString('hex') // conversion en héxadecimal
        //.slice(0, longueur); // on ne garde que le nombre de caractères demandé
};