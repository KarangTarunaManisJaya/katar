const fs = require('fs');
const path = require('path');

const files = [
  'node_modules/html2canvas/dist/html2canvas.js',
  'node_modules/html2canvas/dist/html2canvas.esm.js',
  'node_modules/.vite/deps/html2canvas.js'
];

for (const rel of files) {
  const p = path.resolve(__dirname, rel);
  if (fs.existsSync(p)) {
    let c = fs.readFileSync(p, 'utf8');
    let patched = false;
    c = c.replace(/if\s*\(\s*typeof colorFunction === ['"]undefined['"]\s*\)\s*\{?\s*throw new Error\([^)]+\);?\s*\}?/g, () => {
      patched = true;
      return 'if (typeof colorFunction === "undefined") { return 0x2563ebff; }';
    });
    if (patched) {
      fs.writeFileSync(p, c, 'utf8');
      console.log('Successfully patched html2canvas color support:', rel);
    }
  }
}
