import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const replacements = [
  { from: /bg-\[#0A0F0D\]/g, to: 'bg-slate-50 dark:bg-[#0A0F0D]' },
  { from: /bg-\[#1A1F1C\]/g, to: 'bg-white dark:bg-[#1A1F1C]' },
  { from: /text-slate-200/g, to: 'text-slate-800 dark:text-slate-200' },
  { from: /text-slate-300/g, to: 'text-slate-600 dark:text-slate-300' },
  { from: /text-slate-400/g, to: 'text-slate-500 dark:text-slate-400' },
  { from: /text-white/g, to: 'text-slate-900 dark:text-white' },
  { from: /border-white\/5/g, to: 'border-slate-200 dark:border-white/5' },
  { from: /border-white\/10/g, to: 'border-slate-200 dark:border-white/10' },
  { from: /border-white\/20/g, to: 'border-slate-300 dark:border-white/20' },
  { from: /bg-white\/5/g, to: 'bg-slate-100 dark:bg-white/5' },
  { from: /bg-white\/10/g, to: 'bg-slate-200 dark:bg-white/10' },
  { from: /hover:bg-white\/5/g, to: 'hover:bg-slate-100 dark:hover:bg-white/5' },
  { from: /hover:bg-white\/10/g, to: 'hover:bg-slate-200 dark:hover:bg-white/10' },
  { from: /hover:text-white/g, to: 'hover:text-slate-900 dark:hover:text-white' },
  { from: /from-\[#0A0F0D\]/g, to: 'from-slate-50 dark:from-[#0A0F0D]' },
  { from: /via-\[#0A0F0D\]/g, to: 'via-slate-50 dark:via-[#0A0F0D]' },
  { from: /to-\[#0A0F0D\]/g, to: 'to-slate-50 dark:to-[#0A0F0D]' },
  { from: /bg-black\/50/g, to: 'bg-slate-200/50 dark:bg-black/50' },
  { from: /bg-black\/40/g, to: 'bg-slate-200/40 dark:bg-black/40' },
  { from: /bg-black\/20/g, to: 'bg-slate-200/20 dark:bg-black/20' },
  // Fix cases where we might have duplicated dark:dark:
  { from: /dark:dark:/g, to: 'dark:' },
  { from: /text-slate-900 dark:text-slate-900 dark:text-white/g, to: 'text-slate-900 dark:text-white' }
];

replacements.forEach(({ from, to }) => {
  content = content.replace(from, to);
});

// Also add the theme toggle button to the header
// Find the language selector and add the theme toggle next to it
const headerSearch = `<div className="relative" ref={langDropdownRef}>`;
const themeToggleCode = `
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
`;

if (content.includes(headerSearch) && !content.includes('toggleTheme')) {
  content = content.replace(headerSearch, themeToggleCode + '\n          ' + headerSearch);
}

// Add imports for Sun, Moon and useTheme
if (!content.includes('Sun, Moon')) {
  content = content.replace('import { \n  Leaf', 'import { \n  Leaf, Sun, Moon');
}
if (!content.includes('useTheme')) {
  content = content.replace("import { ErrorBoundary } from './components/ErrorBoundary';", "import { ErrorBoundary } from './components/ErrorBoundary';\nimport { useTheme } from './contexts/ThemeContext';");
}

// Add useTheme hook inside App component
if (!content.includes('const { theme, toggleTheme } = useTheme();')) {
  content = content.replace('const App = () => {', 'const App = () => {\n  const { theme, toggleTheme } = useTheme();');
}

fs.writeFileSync('src/App.tsx', content);
console.log('Done replacing classes in App.tsx');
