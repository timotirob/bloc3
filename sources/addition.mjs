export const addition = (...listeNombres) => {
    let somme = 0;
    for (const nombre of listeNombres) {
        somme += nombre;
    }
    return somme;
};



