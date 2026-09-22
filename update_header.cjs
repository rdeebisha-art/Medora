const fs = require('fs');
const file = 'src/components/Header.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldHeaderStr = '<div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">\n        <div className="flex items-center justify-between gap-3">';

const newHeaderStr = '<div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">\n        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">';

content = content.replace(oldHeaderStr, newHeaderStr);
content = content.replace(/className="flex items-center gap-1 sm:gap-2 px-1 py-1\.5 max-w-full overflow-x-auto scrollbar-hide"/, 'className="flex items-center gap-1 sm:gap-2 px-1 py-1.5 max-w-full overflow-x-auto scrollbar-hide w-full lg:w-auto"');
content = content.replace(/className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in slide-in-from-top-2"/, 'className="absolute right-0 mt-2 w-64 max-h-[80vh] overflow-y-auto bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in slide-in-from-top-2"');

fs.writeFileSync(file, content, 'utf8');
