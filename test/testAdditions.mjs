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