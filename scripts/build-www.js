// Copia la web (index.html, css/, js/, icons/) a www/, que es lo que Capacitor mete en el APK.
// No copia manifest.json ni sw.js: solo sirven para la versión web/PWA.
// Con --assets-only solo prepara assets/ para generar los iconos de Android.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const assetsOnly = process.argv.includes('--assets-only');

function copyRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyRecursive(s, d); else fs.copyFileSync(s, d);
  }
}

function prepareAssets() {
  // @capacitor/assets espera assets/icon-only.png y assets/icon-foreground.png
  const icons = path.join(root, 'icons');
  const pairs = [
    ['icon-512.png', 'icon-only.png'],
    ['icon-maskable-512.png', 'icon-foreground.png'],
  ];
  fs.mkdirSync(path.join(root, 'assets'), { recursive: true });
  let copied = 0;
  for (const [from, to] of pairs) {
    const src = path.join(icons, from);
    if (fs.existsSync(src)) { fs.copyFileSync(src, path.join(root, 'assets', to)); copied++; }
  }
  if (copied === 0) console.warn('AVISO: no hay icons/icon-512.png ni icons/icon-maskable-512.png; se queda el icono por defecto de Capacitor.');
}

if (assetsOnly) {
  prepareAssets();
  process.exit(0);
}

const www = path.join(root, 'www');
fs.rmSync(www, { recursive: true, force: true });
fs.mkdirSync(www, { recursive: true });
fs.copyFileSync(path.join(root, 'index.html'), path.join(www, 'index.html'));
copyRecursive(path.join(root, 'css'), path.join(www, 'css'));
copyRecursive(path.join(root, 'js'), path.join(www, 'js'));
if (fs.existsSync(path.join(root, 'icons'))) copyRecursive(path.join(root, 'icons'), path.join(www, 'icons'));
console.log('www/ listo');
