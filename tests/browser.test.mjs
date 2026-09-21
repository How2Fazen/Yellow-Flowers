import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { startServer } from '../scripts/serve.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

async function clickFlower(page, index) {
  const flower = page.locator('.flower-button').nth(index);
  // A person can click a swaying flower; Playwright's click waits for a stable target.
  await flower.evaluate(element => element.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' }));
  const box = await flower.boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

test('complete access and garden experience on desktop and mobile', { timeout: 120000 }, async t => {
  const server = await startServer(0);
  const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {}) });
  try {
    for (const viewport of [{ width: 1440, height: 960 }, { width: 390, height: 844 }]) {
      await t.test(`${viewport.width}px: answers, transition, flowers, views, dialogs and integrated music controls`, async () => {
        const context = await browser.newContext({ viewport, reducedMotion: viewport.width < 500 ? 'reduce' : 'no-preference' });
        // Exercise the complete experience without relying on any external CDN.
        await context.route(/^https:\/\//, route => route.fulfill({ status: 200, body: '', contentType: 'text/css' }));
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
        await page.goto(`http://127.0.0.1:${server.address().port}`, { waitUntil: 'networkidle' });
        assert.equal(await page.locator('#garden').isVisible(), false);
        assert.equal(await page.locator('#answer').isVisible(), true);
        assert.equal(await page.locator('#access-ambience').count(), 1);
        assert.equal(await page.locator('#magic-glow').count(), 1);
        assert.ok(await page.locator('#petal-field .floating-petal').count() >= (viewport.width < 500 ? 8 : 20));
        assert.ok(await page.locator('#firefly-field .access-firefly').count() >= (viewport.width < 500 ? 10 : 24));
        assert.match(await page.title(), /Yadira/);
        assert.equal(await page.locator('.identity-name').innerText(), 'Yadira');
        assert.match(await page.locator('.identity-avatar').innerText(), /Y/);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        if (viewport.width < 500) {
          assert.equal(await page.locator('#access').evaluate(el => el.classList.contains('mobile-lite')), true);
          const cardBox = await page.locator('#access-card').boundingBox();
          const buttonBox = await page.locator('#verify-button').boundingBox();
          assert.ok(cardBox.width <= viewport.width - 12, 'access card must fit the phone viewport');
          assert.ok(buttonBox.height >= 44, 'primary mobile action must keep a comfortable tap target');
        } else {
          await page.mouse.move(1100, 420);
          await page.waitForTimeout(80);
          const tilt = await page.locator('#access-card').evaluate(el => getComputedStyle(el).getPropertyValue('--card-tilt-y').trim());
          assert.notEqual(tilt, '0deg', 'desktop card should react subtly to pointer movement');
        }
        await page.locator('#verify-button').click();
        await page.locator('#answer-feedback').filter({ hasText: 'incorrecto' }).waitFor();
        await page.locator('#answer').fill('amarillo');
        await page.locator('#answer').press('Enter');
        assert.equal(await page.locator('#answer').inputValue(), '');
        assert.match(await page.locator('#verification-label').innerText(), /1\/3/);

        const correctAnswers = [
          [viewport.width < 500 ? '  LÍLA ' : ' MORADO ', 'obviamente lo sabía'],
          [' AJÍ   DE GALLINA ', 'cómo no voy a saber eso'],
          [' Cheesecake de MARACUYÁ ', 'jamás me olvidaría'],
        ];
        for (const [index, [answer, expectedReaction]] of correctAnswers.entries()) {
          assert.match(await page.locator('#question-label').innerText(), /Yadira/);
          await page.locator('#answer').fill(answer);
          await page.locator('#answer').press('Enter');
          await page.locator('#answer-feedback').filter({ hasText: 'aceptado' }).waitFor();
          assert.match(await page.locator('#answer-feedback').innerText(), new RegExp(expectedReaction, 'i'));
          assert.equal(await page.locator('#verify-button').isDisabled(), true);
          // Extra events during the accepted animation must never skip another question.
          await page.locator('#verification-form').dispatchEvent('submit');
          if (index < 2) {
            await page.waitForFunction(n => document.querySelector('#verification-label').textContent.includes(`${n}/3`) && !document.querySelector('#answer').disabled, index + 2);
          }
        }
        await page.locator('#granted-panel').waitFor({ state: 'visible' });
        assert.match(await page.locator('#access-status').innerText(), /Concedido/);
        await page.locator('#reveal').waitFor({ state: 'visible' });
        await page.locator('#garden').waitFor({ state: 'visible', timeout: 20000 });
        await page.locator('#reveal').waitFor({ state: 'hidden' });
        assert.equal(await page.locator('#access').isVisible(), false);
        assert.equal(await page.locator('.flower-button').count(), 6);
        const centeredHeads = await page.locator('.flower-button').evaluateAll(buttons => buttons.every(button => {
          const box = button.getBoundingClientRect();
          const head = button.querySelector('use').getBoundingClientRect();
          return Math.abs(box.x + box.width / 2 - head.x - head.width / 2) < 2 && Math.abs(box.y + box.height / 2 - head.y - head.height / 2) < 2;
        }));
        assert.equal(centeredHeads, true, 'sunflower illustrations must align with their stems and clickable areas');
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        assert.equal(await page.locator('#garden-title').evaluate(el => el === document.activeElement), true);

        const noteKeywords = ['ojos', 'manera tan rara', 'sabes tratarme', 'momentos más simples', 'tranquilidad', 'seguir eligiéndote'];
        for (let index = 0; index < 6; index++) {
          await clickFlower(page, index);
          assert.equal(await page.locator('#note-dialog').isVisible(), true);
          assert.match(await page.locator('#note-page').innerText(), new RegExp(`${index + 1} / 6`));
          assert.match((await page.locator('#note-title').innerText() + ' ' + await page.locator('#note-text').innerText()).toLowerCase(), new RegExp(noteKeywords[index], 'i'));
          await page.keyboard.press('Escape');
        }
        assert.match(await page.locator('#note-count').innerText(), /6 de 6/);
        await page.locator('#bouquet-button').click();
        assert.equal(await page.locator('#garden').getAttribute('data-view'), 'bouquet');
        await page.waitForTimeout(1400);
        await clickFlower(page, 2);
        await page.locator('#next-note').click();
        assert.match(await page.locator('#note-page').innerText(), /4 \/ 6/);
        await page.locator('#previous-note').click();
        assert.match(await page.locator('#note-page').innerText(), /3 \/ 6/);
        await page.locator('#note-dialog .dialog-close').click();
        await page.locator('#meadow-button').click();
        assert.equal(await page.locator('#garden').getAttribute('data-view'), 'meadow');
        await page.locator('#theme-button').click();
        assert.equal(await page.locator('#theme-button').getAttribute('aria-pressed'), 'true');
        await page.locator('#theme-button').click();
        assert.equal(await page.locator('#theme-button').getAttribute('aria-pressed'), 'false');
        assert.equal(await page.locator('#volume-slider').count(), 1);
        assert.equal(await page.locator('#volume-button').count(), 1);
        assert.equal(await page.locator('#youtube-audio-host').getAttribute('data-video-id'), 'e8O4bGg1zQs');
        assert.match(await page.locator('.song-note').innerText(), /Ninguna como tú/i);
        await page.locator('#volume-slider').evaluate(element => {
          element.value = '20';
          element.dispatchEvent(new Event('input', { bubbles: true }));
        });
        assert.equal(await page.locator('#volume-value').innerText(), '20%');
        assert.equal(await page.locator('#volume-button').getAttribute('aria-pressed'), 'false');
        await page.locator('#letter-button').click();
        assert.equal(await page.locator('#letter-dialog').isVisible(), true);
        assert.equal(await page.locator('#letter-title').innerText(), 'Querida Yadira,');
        assert.match(await page.locator('#letter-dialog').innerText(), /volver a juntarnos/i);
        assert.match(await page.locator('#letter-dialog .dialog-signature').innerText(), /Erwin, o mejor conocido como Ewin/);
        await page.locator('#letter-dialog .dialog-close').click();
        await page.locator('#surprise-button').click();
        assert.equal(await page.locator('#surprise-dialog').isVisible(), true);
        assert.match(await page.locator('#surprise-title').innerText(), /camino de vuelta/i);
        await page.locator('#more-confetti').click();
        await page.keyboard.press('Escape');
        assert.deepEqual(errors, []);
        await context.close();
      });
    }
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
});
