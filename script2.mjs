import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const replacements = [
  { from: /text-emerald-400/g, to: 'text-emerald-600 dark:text-emerald-400' },
  { from: /text-emerald-600 dark:text-emerald-600 dark:text-emerald-400/g, to: 'text-emerald-600 dark:text-emerald-400' },
  { from: /text-emerald-700 dark:text-emerald-600 dark:text-emerald-400/g, to: 'text-emerald-700 dark:text-emerald-400' },
  { from: /text-red-400/g, to: 'text-red-600 dark:text-red-400' },
  { from: /text-red-600 dark:text-red-600 dark:text-red-400/g, to: 'text-red-600 dark:text-red-400' },
  { from: /text-red-700 dark:text-red-600 dark:text-red-400/g, to: 'text-red-700 dark:text-red-400' },
  { from: /text-amber-400/g, to: 'text-amber-600 dark:text-amber-400' },
  { from: /text-amber-600 dark:text-amber-600 dark:text-amber-400/g, to: 'text-amber-600 dark:text-amber-400' },
  { from: /text-amber-700 dark:text-amber-600 dark:text-amber-400/g, to: 'text-amber-700 dark:text-amber-400' },
  { from: /hover:text-emerald-300/g, to: 'hover:text-emerald-700 dark:hover:text-emerald-300' },
  { from: /hover:text-red-300/g, to: 'hover:text-red-700 dark:hover:text-red-300' },
  { from: /hover:text-amber-300/g, to: 'hover:text-amber-700 dark:hover:text-amber-300' },
];

replacements.forEach(({ from, to }) => {
  content = content.replace(from, to);
});

fs.writeFileSync('src/App.tsx', content);
console.log('Done fixing contrast colors');
