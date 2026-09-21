# Yellow Flowers 🌻

Una sorpresa interactiva para Abigail: un acceso misterioso que se transforma en un jardín de girasoles. Sitio estático, sin cuentas, sin base de datos y sin compilación.

## Abrir el proyecto

Con Node.js 20 o posterior:

```sh
npm run dev
```

Abre **http://127.0.0.1:4173**. También puedes usar cualquier servidor de archivos estáticos. Sirve el proyecto por HTTP: los módulos JavaScript no se cargan correctamente al abrir `index.html` con `file://`.

## La experiencia

- Tres verificaciones sobre Abigail, con normalización de mayúsculas, espacios y acentos.
- Errores con feedback y reintento; protección frente a envíos repetidos.
- Acceso concedido, cuenta regresiva, pausa negra y revelación cinematográfica.
- Seis girasoles dibujados en SVG, cada uno con una nota.
- Vistas de prado y bouquet; cambio entre día y noche.
- Carta, sorpresa final y confetti.
- Navegación con teclado, modales con Escape, retorno del foco y movimiento reducido.

Las verificaciones son parte de la sorpresa: **no son autenticación ni protegen información**. Las respuestas están en el código del navegador. No se recopilan ni guardan respuestas.

## Archivos

| Archivo | Responsabilidad |
| --- | --- |
| `index.html` | Contenido, estructura, modales y controles |
| `style.css` | Diseño, jardín, animaciones, móvil y movimiento reducido |
| `verification.js` | Preguntas, normalización y avance de verificaciones |
| `app.js` | Interacciones, revelación, flores, notas, música y confetti |
| `scripts/serve.mjs` | Servidor local de desarrollo |
| `tests/` | Pruebas de lógica y recorrido en navegador |

Tailwind CSS, Font Awesome y Google Fonts se cargan por CDN. Los estilos esenciales, ilustraciones y lógica son locales; el sitio también funciona si los CDN no están disponibles. Las fuentes alternativas son Georgia y Arial.

## Música

El repositorio **no incluye ningún archivo de audio**. El control está preparado y muestra un mensaje discreto mientras no haya canción; no solicita una ruta inexistente.

Para activar la música:

1. Añade al repositorio un archivo de audio que puedas utilizar.
2. En `index.html`, establece `data-src` del elemento `background-music` a la ruta relativa exacta de ese archivo.

La reproducción se intenta durante la primera interacción con las verificaciones. El botón musical permite iniciar o pausar; los errores y bloqueos de reproducción se manejan sin interrumpir la página.

## Personalización

- Cambia las preguntas y respuestas en `verification.js`.
- Edita los seis mensajes en el arreglo `notes` de `app.js`.
- Edita la carta y la sorpresa final en `index.html`.
- Ajusta colores y tipografías en las variables de `style.css`.

## Pruebas

Las pruebas de lógica no necesitan instalar dependencias:

```sh
npm test
```

Para el recorrido de escritorio y móvil, instala opcionalmente Playwright:

```sh
npm install --no-save playwright
npx playwright install chromium
npm run test:browser
```

Las pruebas de navegador levantan su propio servidor, completan las tres verificaciones y comprueban errores, doble envío, transición, notas, vistas, modales, música sin archivo y consola. Bloquean los CDN con respuestas vacías para comprobar que la experiencia no depende de ellos. `BROWSER_CHANNEL=msedge` permite usar Edge instalado; `PLAYWRIGHT_MODULE` permite apuntar a una instalación existente de Playwright.

## Publicar en GitHub Pages

El proyecto está listo para hospedarse como sitio estático. En el repositorio: **Settings → Pages → Deploy from a branch → main → / (root)**. No se necesita un paso de compilación. Activar Pages es independiente de subir los archivos al repositorio.
