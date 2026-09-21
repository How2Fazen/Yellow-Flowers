// This is a playful reveal, not authentication. Answers are intentionally client-side.
export const verificationQuestions = [
  { question: '¿Cuál es el color favorito de Yadira?', answers: ['morado', 'lila'], successMessage: 'Pfff... obviamente lo sabía 😌' },
  { question: '¿Comida favorita de Yadira?', answers: ['ají de gallina', 'combinado', 'trío marino', 'trio marino'], successMessage: 'Por favooor... ¿cómo no voy a saber eso? 💜' },
  { question: '¿Postre favorito de Yadira?', answers: ['cheesecake de maracuyá', 'torta de tres leches', 'torta de 3 leches'], successMessage: 'Es lo único de lo que jamás me olvidaría. 🤍' },
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
      const message = accepted ? question.successMessage : undefined;
      if (accepted) index += 1;
      return { accepted, complete: index === verificationQuestions.length, index, ...(message ? { message } : {}) };
    },
  };
}
