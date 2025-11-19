import argon2 from "argon2";

export async function hashMonMdp(mdp) {
    try {
        return await argon2.hash(mdp);
    } catch (err) {
        console.error('Erreur hashage:', err);
        throw err;
    }
}

export async function verifieMdp(hash, mdp) {
    try {
        // argon2.verify retourne une Promesse qui résout en true/false
        return await argon2.verify(hash, mdp);
    } catch (err) {
        console.error('Erreur vérification:', err);
        return false;
    }
}