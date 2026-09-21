import { createVerification, verificationQuestions } from './verification.js';

const $ = id => document.getElementById(id);
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const verification = createVerification();
let verificationBusy = false;
let musicAttempted = false;
let musicBusy = false;
let toastTimer;

function showToast(message) {
  clearTimeout(toastTimer);
  $('toast').textContent = message;
  $('toast').classList.add('show');
  toastTimer = setTimeout(() => $('toast').classList.remove('show'), 4500);
}

function updateMusicButton(playing) {
  $('music-button').setAttribute('aria-pressed', String(playing));
  const label = playing ? 'Pausar música' : 'Activar música';
  $('music-button').setAttribute('aria-label', label);
  $('music-button').title = label;
}

// No src means no request. Add a real file to data-src in index.html to enable music.
async function playMusic(manual = false) {
  const audio = $('background-music');
  if (musicBusy || !audio.paused) return;
  const source = audio.dataset.src.trim();
  if (!source) {
    const link = audio.dataset.link?.trim();
    if (manual && link) {
      showToast(audio.dataset.message || 'Esta canción es la que te escribí <3');
      window.open(link, '_blank', 'noopener,noreferrer');
    } else if (manual) {
      showToast('Este jardín no tiene música todavía. Las flores sí tienen mucho que decir. ♡');
    }
    return;
  }
  musicBusy = true;
  if (!audio.getAttribute('src')) audio.src = source;
  audio.volume = 0.35;
  try {
    // Called synchronously from submit/click, within the browser's user gesture.
    await audio.play();
    updateMusicButton(true);
  } catch {
    updateMusicButton(false);
    if (manual) showToast('No se pudo reproducir la música. Puedes seguir disfrutando del jardín.');
  } finally {
    musicBusy = false;
  }
}

$('music-button').addEventListener('click', () => {
  const audio = $('background-music');
  if (musicBusy) return;
  if (!audio.paused) {
    audio.pause();
    updateMusicButton(false);
  } else {
    void playMusic(true);
  }
});
$('background-music').addEventListener('pause', () => updateMusicButton(false));
$('background-music').addEventListener('error', () => updateMusicButton(false));

function updateProgress(index) {
  document.querySelectorAll('#verification-progress li').forEach((step, stepIndex) => {
    step.classList.toggle('completed', stepIndex < index);
    step.classList.toggle('current', stepIndex === index);
    if (stepIndex === index) step.setAttribute('aria-current', 'step');
    else step.removeAttribute('aria-current');
    step.querySelector('.step-dot').textContent = stepIndex < index ? '✓' : String(stepIndex + 1);
  });
}

$('verification-form').addEventListener('submit', async event => {
  event.preventDefault();
  if (verificationBusy) return;
  if (!musicAttempted) {
    musicAttempted = true;
    void playMusic();
  }
  const input = $('answer');
  const feedback = $('answer-feedback');
  const result = verification.submit(input.value);
  $('answer-wrap').classList.remove('error');
  if (!result.accepted) {
    feedback.classList.remove('success');
    feedback.textContent = '✕ Código incorrecto.\nInténtalo nuevamente.';
    input.value = '';
    input.setAttribute('aria-invalid', 'true');
    void $('answer-wrap').offsetWidth;
    $('answer-wrap').classList.add('error');
    input.focus();
    return;
  }

  verificationBusy = true;
  input.disabled = true;
  $('verify-button').disabled = true;
  input.removeAttribute('aria-invalid');
  feedback.classList.add('success');
  feedback.textContent = `✓ Código aceptado.\n${result.message}`;
  updateProgress(result.index);
  await wait(1100);
  if (result.complete) {
    await revealGarden();
    return;
  }
  $('verification-label').textContent = `VERIFICACIÓN ${result.index + 1}/3`;
  $('question-label').textContent = verificationQuestions[result.index].question;
  $('question-content').classList.remove('question-enter');
  void $('question-content').offsetWidth;
  $('question-content').classList.add('question-enter');
  input.value = '';
  input.disabled = false;
  feedback.textContent = '';
  $('verify-button').disabled = false;
  verificationBusy = false;
  input.focus({ preventScroll: true });
});

async function revealGarden() {
  $('verification-panel').hidden = true;
  $('access-status').textContent = '🔓 Concedido';
  $('access-status').classList.add('granted');
  $('granted-panel').hidden = false;
  $('granted-panel').focus({ preventScroll: true });
  await wait(2800);
  $('countdown-area').hidden = false;
  for (const number of [3, 2, 1]) {
    $('countdown').classList.remove('number-pop');
    $('countdown').textContent = String(number);
    void $('countdown').offsetWidth;
    $('countdown').classList.add('number-pop');
    await wait(1050);
  }
  $('reveal').hidden = false;
  $('reveal').focus({ preventScroll: true });
  $('access').inert = true;
  await wait(850); // A completely black beat before the romantic reveal.
  $('access').hidden = true;
  $('reveal-message').classList.add('visible');
  await wait(3300);
  $('garden').hidden = false;
  window.scrollTo({ top: 0, behavior: 'instant' });
  $('reveal').classList.add('fade-out');
  await wait(motionPreference.matches ? 200 : 1800);
  $('reveal').hidden = true;
  $('garden').inert = false;
  $('garden-title').focus({ preventScroll: true });
  document.querySelector('meta[name="theme-color"]').content = '#fbf6e9';
}

const notes = [
  { title: 'Tus ojos', text: 'Me gustan tus ojos. No sé si es la forma en la que miras o todo lo que transmiten, pero podría quedarme viéndolos más de lo que debería.' },
  { title: 'Tu felicidad tan tuya', text: 'Me gusta esa manera tan rara y tan tuya en la que logras sentirte feliz. A veces no la entiendo del todo, pero me encanta verla.' },
  { title: 'Cómo sabes tratarme', text: 'Me gusta la manera en la que sabes tratarme para hacerme feliz, incluso en esos momentos en los que ni yo sé muy bien qué necesito.' },
  { title: 'Lo especial de lo simple', text: 'Me gusta cómo haces que hasta los momentos más simples se sientan especiales. Contigo, un rato cualquiera puede terminar siendo un recuerdo bonito.' },
  { title: 'La calma de estar contigo', text: 'Me gusta la tranquilidad que puedo sentir cuando estoy contigo, incluso cuando las cosas no son fáciles. Hay algo en ti que siempre se siente como volver a casa.' },
  { title: 'Seguir eligiéndote', text: 'Me gusta que, aun después de nuestros problemas, una parte de mí siempre quiera elegirte, arreglar las cosas contigo y encontrar otra vez nuestra manera de ser felices.' },
];

function buildSunflowers() {
  // Two layers of drawn petals and a Fibonacci seed head, shared by every flower.
  const petals = Array.from({ length: 18 }, (_, i) => `<path d="M0-22C-12-34-13-51 0-69C13-51 12-34 0-22Z" transform="rotate(${i * 20})" fill="url(#petal-gold)" stroke="#d6a132" stroke-width=".45"/>`).join('');
  const seeds = Array.from({ length: 115 }, (_, i) => {
    const radius = 2.18 * Math.sqrt(i);
    const angle = i * 2.39996;
    return `<circle cx="${(radius * Math.cos(angle)).toFixed(2)}" cy="${(radius * Math.sin(angle)).toFixed(2)}" r="${i < 30 ? .9 : 1.15}" fill="${i % 3 === 0 ? '#c39958' : '#a37b40'}" opacity=".7"/>`;
  }).join('');
  document.querySelector('.svg-library defs').insertAdjacentHTML('beforeend', `<symbol id="sunflower-head" viewBox="-80 -80 160 160"><g class="flower-head"><g transform="rotate(10) scale(.91)" opacity=".85">${petals}</g>${petals}<circle r="27" fill="url(#flower-center)" stroke="#bd8734" stroke-width="2"/>${seeds}</g></symbol>`);
  notes.forEach((note, index) => {
    const flower = document.createElement('div');
    flower.className = 'flower';
    flower.innerHTML = `<div class="flower-stem" aria-hidden="true"></div><div class="stem-leaf" aria-hidden="true"></div><div class="stem-leaf second" aria-hidden="true"></div><button class="flower-button" type="button" aria-label="Abrir nota ${index + 1}: ${note.title}"><svg viewBox="-80 -80 160 160" aria-hidden="true"><use href="#sunflower-head" x="-80" y="-80" width="160" height="160"/></svg><span class="flower-visited" aria-hidden="true">✓</span></button>`;
    flower.querySelector('button').addEventListener('click', () => openNote(index));
    $('flowers').append(flower);
  });
}

function addAtmosphere() {
  for (let i = 0; i < 22; i++) {
    const light = document.createElement('i');
    light.style.cssText = `left:${(i * 37 + 7) % 100}%;top:${(i * 23 + 13) % 100}%;animation-delay:-${i % 6}s`;
    $('access-particles').append(light);
    if (i < 12) $('fireflies').append(light.cloneNode());
  }
  for (let i = 0; i < 28; i++) {
    const flower = document.createElement('span');
    flower.className = 'mini-flower';
    flower.style.cssText = `left:${(i * 19 + 3) % 100}%;height:${40 + (i * 17) % 65}px;--lean:${(i * 7) % 28 - 14}deg;bottom:${(i * 13) % 35}px`;
    $('distant-flowers').append(flower);
  }
  for (let i = 0; i < 90; i++) {
    const blade = document.createElement('i');
    blade.className = 'grass-blade';
    blade.style.cssText = `left:${i * 1.13}%;--height:${15 + (i * 13) % 85}px;--lean:${(i * 11) % 60 - 30}deg`;
    $('scene-grass').append(blade);
  }
}

let currentNote = 0;
const visitedNotes = new Set();
function renderNote(index) {
  currentNote = index;
  visitedNotes.add(index);
  $('note-number').textContent = `UN PEQUEÑO MOTIVO · ${String(index + 1).padStart(2, '0')}`;
  $('note-title').textContent = notes[index].title;
  $('note-text').textContent = notes[index].text;
  $('note-page').textContent = `${index + 1} / ${notes.length}`;
  $('previous-note').disabled = index === 0;
  $('next-note').disabled = index === notes.length - 1;
  document.querySelectorAll('.flower-button')[index].classList.add('visited');
  $('note-count').textContent = `${visitedNotes.size} de 6 pequeños motivos descubiertos.`;
}
function openNote(index) {
  renderNote(index);
  $('note-dialog').showModal();
}
$('previous-note').addEventListener('click', () => { if (currentNote > 0) renderNote(currentNote - 1); });
$('next-note').addEventListener('click', () => { if (currentNote < notes.length - 1) renderNote(currentNote + 1); });

for (const dialog of document.querySelectorAll('dialog')) {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  // Only a click both starting and ending outside the dialog dismisses it.
  let backdropPress = false;
  const outside = event => {
    const rect = dialog.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  };
  dialog.addEventListener('pointerdown', event => { backdropPress = event.target === dialog && outside(event); });
  dialog.addEventListener('click', event => {
    if (backdropPress && event.target === dialog && outside(event)) dialog.close();
    backdropPress = false;
  });
}
$('letter-button').addEventListener('click', () => $('letter-dialog').showModal());

function setView(view) {
  $('garden').dataset.view = view;
  for (const name of ['meadow', 'bouquet']) {
    const selected = name === view;
    $(`${name}-button`).classList.toggle('active', selected);
    $(`${name}-button`).setAttribute('aria-pressed', String(selected));
  }
  $('scene-hint').textContent = view === 'bouquet' ? 'Un bouquet que nunca se marchita. Solo para ti.' : 'Cada girasol guarda algo que quiero decirte.';
}
$('meadow-button').addEventListener('click', () => setView('meadow'));
$('bouquet-button').addEventListener('click', () => setView('bouquet'));
$('theme-button').addEventListener('click', () => {
  const night = $('garden').classList.toggle('night');
  const label = night ? 'Cambiar a día' : 'Cambiar a noche';
  $('theme-button').setAttribute('aria-pressed', String(night));
  $('theme-button').setAttribute('aria-label', label);
  $('theme-button').title = label;
  $('theme-button').querySelector('use').setAttribute('href', night ? '#icon-sun' : '#icon-moon');
  document.querySelector('meta[name="theme-color"]').content = night ? '#101e24' : '#fbf6e9';
});

let confettiFrame;
function launchConfetti() {
  cancelAnimationFrame(confettiFrame);
  const canvas = $('confetti');
  const context = canvas.getContext('2d');
  if (!context) return;
  const bounds = canvas.getBoundingClientRect();
  const scale = Math.min(devicePixelRatio || 1, 2);
  canvas.width = bounds.width * scale;
  canvas.height = bounds.height * scale;
  context.scale(scale, scale);
  if (motionPreference.matches) return;
  const colors = ['#e9c46a', '#b89fb3', '#a8b580', '#f6dc9a', '#ddaa8f'];
  const pieces = Array.from({ length: 85 }, () => ({
    x: bounds.width / 2, y: bounds.height * .35,
    vx: (Math.random() - .5) * 8, vy: -3 - Math.random() * 6,
    size: 3 + Math.random() * 4, angle: Math.random() * Math.PI,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
  let previousTime;
  const started = performance.now();
  function animate(time) {
    const delta = Math.min((time - (previousTime ?? time)) / 16.67, 2);
    previousTime = time;
    context.clearRect(0, 0, bounds.width, bounds.height);
    for (const piece of pieces) {
      piece.x += piece.vx * delta;
      piece.y += piece.vy * delta;
      piece.vy += .085 * delta;
      piece.angle += .025 * delta;
      context.save();
      context.translate(piece.x, piece.y);
      context.rotate(piece.angle);
      context.globalAlpha = Math.max(0, 1 - (time - started) / 5000);
      context.fillStyle = piece.color;
      context.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * .55);
      context.restore();
    }
    if (time - started < 5000 && $('surprise-dialog').open && !motionPreference.matches) confettiFrame = requestAnimationFrame(animate);
    else context.clearRect(0, 0, bounds.width, bounds.height);
  }
  confettiFrame = requestAnimationFrame(animate);
}
$('surprise-button').addEventListener('click', () => { $('surprise-dialog').showModal(); launchConfetti(); });
$('more-confetti').addEventListener('click', launchConfetti);
$('surprise-dialog').addEventListener('close', () => cancelAnimationFrame(confettiFrame));

buildSunflowers();
addAtmosphere();
