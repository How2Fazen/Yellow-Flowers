import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAnswer, createVerification } from '../verification.js';

test('normalizes accents, case, repeated whitespace and Unicode accents', () => {
  assert.equal(normalizeAnswer('  LÍLA  '), 'lila');
  assert.equal(normalizeAnswer(' AJÍ \t DE\n GALLINA '), 'aji de gallina');
  assert.equal(normalizeAnswer('CHEESECAKE de maracuyá'), 'cheesecake de maracuya');
});

test('wrong or empty answers do not advance or disclose the solution', () => {
  const session = createVerification();
  for (const answer of ['', '   ', 'amarillo', 'torta de chocolate', 'lila extra']) {
    assert.deepEqual(session.submit(answer), { accepted: false, complete: false, index: 0 });
  }
});

test('accepts all of Yadira’s favorite food and dessert answers in order', () => {
  const favoriteFoods = ['Ají   de GALLINA', ' COMBINADO ', 'TRÍO MARINO', 'trio marino'];
  const favoriteDesserts = ['Cheesecake de Maracuyá', 'Torta de tres leches', 'TORTA DE 3 LECHES'];

  for (const color of [' MORADO ', ' LÍLA ']) {
    for (const food of favoriteFoods) {
      for (const dessert of favoriteDesserts) {
        const session = createVerification();
        assert.deepEqual(session.submit(color), { accepted: true, complete: false, index: 1, message: 'Pfff... obviamente lo sabía 😌' });
        assert.deepEqual(session.submit(food), { accepted: true, complete: false, index: 2, message: 'Por favooor... ¿cómo no voy a saber eso? 💜' });
        assert.deepEqual(session.submit(dessert), { accepted: true, complete: true, index: 3, message: 'Es lo único de lo que jamás me olvidaría. 🤍' });
      }
    }
  }
});

test('a new visit has an independent verification session', () => {
  createVerification().submit('lila');
  assert.equal(createVerification().submit('aji de gallina').index, 0);
});
