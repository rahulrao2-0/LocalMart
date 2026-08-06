const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules') continue;
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (file.endsWith('.js') && file !== 'convert.js') {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // replace require with import
      content = content.replace(/const\s+(.+?)\s*=\s*require\(['"](.+?)['"]\);?/g, (match, p1, p2) => {
        let importPath = p2;
        if (importPath.startsWith('.')) {
          if (!importPath.endsWith('.js')) {
            importPath += '.js';
          }
        }
        return `import ${p1} from '${importPath}';`;
      });
      
      // replace module.exports = { X, Y }
      content = content.replace(/module\.exports\s*=\s*\{([^}]+)\};?/g, 'export { $1 };');
      
      // replace module.exports = X
      content = content.replace(/module\.exports\s*=\s*(.+?);?/g, (match, p1) => {
        if (p1.trim().startsWith('{')) return match; // already handled
        return `export default ${p1};`;
      });

      fs.writeFileSync(fullPath, content);
      console.log('Updated', fullPath);
    }
  }
}

processDir('.');
