const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules') continue;
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (file.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const newContent = content.replace(/export default (.)\;(.*)/g, 'export default $1$2');
      if (newContent !== content) {
         fs.writeFileSync(fullPath, newContent);
         console.log('Fixed', fullPath);
      }
    }
  }
}

processDir('.');
