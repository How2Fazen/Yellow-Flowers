import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAnswer, createVerification } from '../verification.js';

test('normalizes accents, case, repeated whitespace and Unicode accents', () => {
  assert.equal(normalizeAnswer('  LÍLA  '), 'lila');
  assert.equal(normalizeAnswer(' ARROZ \t A  LA\n CUBANA '), 'arroz a la cubana');
  assert.equal(normalizeAnswer('Tórta de CHOCOLATE'), 'torta de chocolate');
});

test('wrong or empty answers do not advance or disclose the solution', () => {
  const session = createVerification();
  for (const answer of ['', '   ', 'amarillo', 'torta de chocolate', 'lila extra']) {
    assert.deepEqual(session.submit(answer), { accepted: false, complete: false, index: 0 });
  }
});

test('accepts all three answers in order and completes only on the third', () => {
  const session = createVerification();
  assert.deepEqual(session.submit(' LILA '), { accepted: true, complete: false, index: 1 });
  assert.deepEqual(session.submit('lila'), { accepted: false, complete: false, index: 1 });
  assert.deepEqual(session.submit('Arroz   a la CUBANA'), { accepted: true, complete: false, index: 2 });
  assert.deepEqual(session.submit(' Tórta de Chocolate '), { accepted: true, complete: true, index: 3 });
  assert.deepEqual(session.submit('torta de chocolate'), { accepted: false, complete: true, index: 3 });
});

test('a new visit has an independent verification session', () => {
  createVerification().submit('lila');
  assert.equal(createVerification().submit('arroz a la cubana').index, 0);
});
