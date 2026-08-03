// GitHub Pages (via its CDN) caches dist/index.html and its <script> tags for
// several minutes. Since Expo's web export gives the *entry* bundle a filename
// that doesn't always change between builds, a stale cached index.html can end
// up paired with a freshly-deployed chunk, causing "Requiring unknown module"
// crashes for visitors hitting the site right after a deploy. Appending a
// build-specific query string to every script src forces a fresh fetch of the
// entry point on every deploy, so it always pairs with the chunks it was built
// with.
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');
const buildId = Date.now().toString(36);

const patched = html.replace(
  /(<script src="[^"]+\.js)(")/g,
  (_match, prefix, quote) => `${prefix}?v=${buildId}${quote}`,
);

fs.writeFileSync(indexPath, patched);
console.log(`cache-bust: stamped dist/index.html script tags with ?v=${buildId}`);
