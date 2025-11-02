import { addition } from '../sources/addition.mjs';
import assert from 'assert';

// 'it' définit un cas de test individuel
it('devrait additionner 2 nombres correctement', () => {
    // Assertion : on vérifie que addition(2, 2) est bien égal à 4
    assert.equal(addition(2, 2), 4);
});

it('devrait additionner plusieurs nombres positifs', () => {
    assert.equal(addition(9, 5, 12, 32), 58);
});

it('devrait gérer les nombres négatifs', () => {
    assert.equal(addition(-7, 8, -4, 12, 2), 11);
});

it('devrait retourner 0 avec des nombres décimaux', () => {

    const ecart = Math.abs(addition(-1.1, -2.2, 3.3) - 0);
    const margeErreur = 0.000000000001; // Tolérance pour les erreurs de précision
    assert.ok(ecart < margeErreur, 'La somme de -1.1, -2.2 et 3.3 devrait être proche de 0');
    // Ou bien, si on veut forcer l'égalité stricte (moins recommandé pour les flottants)

    // assert.equal(addition(-1.1, -2.2, 3.3), 0, 'La somme de -1.1, -2.2 et 3.3 devrait être 0');
})