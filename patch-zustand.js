const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.mjs') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('import.meta.env')) {
        content = content.replace(/import\.meta\.env \? import\.meta\.env\.MODE : void 0/g, '("development")');
        content = content.replace(/import\.meta\.env/g, '({ MODE: "development" })');
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

replaceInDir(path.join(__dirname, 'node_modules', 'zustand'));
console.log('Patched zustand to remove import.meta.env');
