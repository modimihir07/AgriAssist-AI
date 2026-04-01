import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(/hover:bg-slate-200 dark:bg-white\/10/g, 'hover:bg-slate-200 dark:hover:bg-white/10');

fs.writeFileSync('src/App.tsx', content);
console.log('Done fixing hover:bg-white/10');
