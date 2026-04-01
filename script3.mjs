import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const replacements = [
  { from: /text-slate-500">Supports JPG/g, to: 'text-slate-500 dark:text-slate-400">Supports JPG' },
  { from: /text-slate-500 cursor-not-allowed/g, to: 'text-slate-500 dark:text-slate-400 cursor-not-allowed' },
  { from: /text-slate-500 text-center/g, to: 'text-slate-500 dark:text-slate-400 text-center' },
  { from: /text-slate-500 uppercase/g, to: 'text-slate-500 dark:text-slate-400 uppercase' },
  { from: /text-slate-500 italic/g, to: 'text-slate-500 dark:text-slate-400 italic' },
  { from: /text-slate-500">\{new Date/g, to: 'text-slate-500 dark:text-slate-400">{new Date' },
  { from: /text-slate-500\`/g, to: 'text-slate-500 dark:text-slate-400`' },
  { from: /placeholder:text-slate-500/g, to: 'placeholder:text-slate-500 dark:placeholder:text-slate-400' },
  { from: /text-slate-500 text-sm flex/g, to: 'text-slate-500 dark:text-slate-400 text-sm flex' }
];

replacements.forEach(({ from, to }) => {
  content = content.replace(from, to);
});

fs.writeFileSync('src/App.tsx', content);
console.log('Done fixing text-slate-500');
