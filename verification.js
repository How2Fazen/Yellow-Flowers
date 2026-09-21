// This is a playful reveal, not authentication. Answers are intentionally client-side.
export const verificationQuestions = [
  { question: '¿Cuál es el color favorito de Yadira?', answers: ['morado', 'lila'] },
  { question: '¿Comida favorita de Yadira?', answers: ['ají de gallina'] },
  { question: '¿Postre favorito de Yadira?', answers: ['cheesecake de maracuyá'] },
];

export function normalizeAnswer(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim().replace(/\s+/g, ' ');
}

export function createVerification() {
  let index = 0;
  return {
    submit(value) {
      const question = verificationQuestions[index];
      const accepted = Boolean(question?.answers.some(answer => normalizeAnswer(answer) === normalizeAnswer(value)));
      if (accepted) index += 1;
      return { accepted, complete: index === verificationQuestions.length, index };
    },
  };
}
