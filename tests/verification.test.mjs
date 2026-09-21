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

test('accepts either favorite color and Yadira’s three answers only in order', () => {
  for (const color of [' MORADO ', ' LÍLA ']) {
    const session = createVerification();
    assert.deepEqual(session.submit(color), { accepted: true, complete: false, index: 1, message: 'Pfff... obviamente lo sabía 😌' });
    assert.deepEqual(session.submit('lila'), { accepted: false, complete: false, index: 1 });
    assert.deepEqual(session.submit('arroz a la cubana'), { accepted: false, complete: false, index: 1 });
    assert.deepEqual(session.submit('Ají   de GALLINA'), { accepted: true, complete: false, index: 2, message: 'Por favooor... ¿cómo no voy a saber eso? 💜' });
    assert.deepEqual(session.submit('torta de chocolate'), { accepted: false, complete: false, index: 2 });
    assert.deepEqual(session.submit(' Cheesecake de Maracuyá '), { accepted: true, complete: true, index: 3, message: 'Es lo único de lo que jamás me olvidaría. 🤍' });
    assert.deepEqual(session.submit('cheesecake de maracuya'), { accepted: false, complete: true, index: 3 });
  }
});

test('a new visit has an independent verification session', () => {
  createVerification().submit('lila');
  assert.equal(createVerification().submit('aji de gallina').index, 0);
});
