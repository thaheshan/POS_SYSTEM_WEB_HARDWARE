const fs = require('fs');
const path = require('path');

function replacePort(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      replacePort(fullPath);
    } else if (entry.isFile() && entry.name === 'route.ts') {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('http://localhost:8000/api/v1')) {
        content = content.replace(/http:\/\/localhost:8000\/api\/v1/g, 'http://localhost:8080/api/v1');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

replacePort('C:\\Users\\Thahe\\Documents\\GitHub\\POS_SYSTEM_WEB_HARDWARE\\admin-dashboard\\app\\api');
console.log('Done replacing ports!');
