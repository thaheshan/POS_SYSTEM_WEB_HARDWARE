const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walkDir(file));
        } else { 
            if(file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
        }
    });
    return results;
}

const files = walkDir('./src/components/auth/register/ui');
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let original = content;
    
    // Fix @/components/ui/ imports
    content = content.replace(/['"]@\/components\/ui\//g, (match) => {
        return match[0] + "@/components/auth/register/ui/";
    });
    
    // Fix @/hooks/use-toast imports
    content = content.replace(/['"]@\/hooks\/use-toast['"]/g, (match) => {
        return match[0] + "@/components/auth/register/ui/use-toast" + match[match.length - 1];
    });

    if(content !== original) {
        fs.writeFileSync(f, content, 'utf8');
        console.log('Fixed', f);
    }
});
