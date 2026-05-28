const fs = require('fs');
const path = require('path');

function searchFiles(dir, regex) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.next') {
        searchFiles(fullPath, regex);
      }
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (regex.test(content)) {
        console.log(`Found in ${fullPath}`);
        const lines = content.split('\n');
        lines.forEach((line, i) => {
          if (regex.test(line)) {
            console.log(`  ${i + 1}: ${line.trim()}`);
          }
        });
      }
    }
  }
}

console.log("Searching for api.get('/stock...:");
searchFiles('C:/Users/Thahe/Documents/GitHub/POS_SYSTEM_WEB_HARDWARE/src', /api\.get\(['"`]\/stock/);

console.log("Searching for api.get('/product...:");
searchFiles('C:/Users/Thahe/Documents/GitHub/POS_SYSTEM_WEB_HARDWARE/src', /api\.get\(['"`]\/product/);
