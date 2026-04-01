import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

content = content.replace(/hover:bg-slate-100 dark:bg-white\/5/g, 'hover:bg-slate-100 dark:hover:bg-white/5');

fs.writeFileSync('src/App.tsx', content);
console.log('Done fixing hover:bg-white/5');
