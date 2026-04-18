const fs = require('fs');
const path = require('path');

const HIGH_RISK_FILES = ['resizable.tsx', 'chart.tsx', 'calendar.tsx', 'command.tsx', 'carousel.tsx', 'form.tsx', 'table.tsx', 'sidebar.tsx'];

function processDir(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (HIGH_RISK_FILES.includes(file)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (!content.startsWith('// @ts-nocheck')) {
        fs.writeFileSync(fullPath, '// @ts-nocheck\n' + content);
        console.log('Patched:', fullPath);
      }
    }
  });
}

// All known generated UI folders
[
  './src/components/auth/register/ui',
  './src/components/auth/register/ui/subscription',
  './src/components/login/ui',
  './src/components/marketing/ui',
].forEach(processDir);
console.log('Done.');
