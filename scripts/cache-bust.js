// GitHub Pages (via its CDN) caches dist/index.html and its <script> tags for
// several minutes. Since Expo's web export gives the *entry* bundle a filename
// that doesn't always change between builds, a stale cached index.html can end
// up paired with a freshly-deployed chunk, causing "Requiring unknown module"
// crashes for visitors hitting the site right after a deploy. Appending a
// build-specific query string to every script src forces a fresh fetch of the
// entry point on every deploy, so it always pairs with the chunks it was built
// with. The same build id also stamps the service worker's cache name so
// each deploy gets its own cache namespace (see public/sw.js).
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distDir, 'index.html');
const swPath = path.join(distDir, 'sw.js');

let html = fs.readFileSync(indexPath, 'utf8');
const buildId = Date.now().toString(36);

html = html.replace(
  /(<script src="[^"]+\.js)(")/g,
  (_match, prefix, quote) => `${prefix}?v=${buildId}${quote}`,
);

// viewport-fit=cover lets env(safe-area-inset-*) resolve to real values
// instead of 0 on notched phones — required for SafeAreaView to actually
// pad around the notch / home indicator once the app runs edge-to-edge
// (standalone PWA or "Add to Home Screen").
html = html.replace(
  /<meta name="viewport" content="([^"]*)"\s*\/?>/,
  (_match, content) => `<meta name="viewport" content="${content}, viewport-fit=cover" />`,
);

// PWA tags: manifest + iOS-specific "add to home screen" support (iOS
// Safari ignores the web manifest for standalone/icon behavior and needs
// its own meta tags and apple-touch-icon link).
const pwaTags = [
  '<link rel="manifest" href="/aqala/manifest.json" />',
  '<link rel="apple-touch-icon" href="/aqala/icons/apple-touch-icon.png" />',
  '<meta name="theme-color" content="#000000" />',
  '<meta name="mobile-web-app-capable" content="yes" />',
  '<meta name="apple-mobile-web-app-capable" content="yes" />',
  '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />',
  '<meta name="apple-mobile-web-app-title" content="Aqal al-Qalil" />',
].join('\n    ');
html = html.replace('</head>', `    ${pwaTags}\n  </head>`);

// Register the service worker right before </body>.
const swRegister = `<script>if ('serviceWorker' in navigator) { window.addEventListener('load', () => navigator.serviceWorker.register('/aqala/sw.js')); }</script>`;
html = html.replace('</body>', `${swRegister}\n</body>`);

fs.writeFileSync(indexPath, html);

if (fs.existsSync(swPath)) {
  const sw = fs.readFileSync(swPath, 'utf8').replace('__BUILD_ID__', buildId);
  fs.writeFileSync(swPath, sw);
  console.log(`cache-bust: stamped dist/sw.js cache version ${buildId}`);
} else {
  console.warn('cache-bust: dist/sw.js not found — was public/sw.js copied by the export?');
}

console.log(`cache-bust: stamped dist/index.html script tags + PWA tags with build ${buildId}`);
