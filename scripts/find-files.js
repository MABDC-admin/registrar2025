const fs = require('fs');
const path = require('path');

const cwd = process.cwd();
console.log('CWD:', cwd);

// List everything in CWD
const entries = fs.readdirSync(cwd);
console.log('Root entries:', entries.join(', '));

// Check various possible locations
const possiblePaths = [
  '/home/user/src',
  '/vercel/share/v0-project/src', 
  path.join(cwd, 'src'),
  '/vercel/share/v0-project',
  '/vercel/share',
];

for (const p of possiblePaths) {
  const exists = fs.existsSync(p);
  console.log(`${p} exists: ${exists}`);
  if (exists && fs.statSync(p).isDirectory()) {
    const items = fs.readdirSync(p).slice(0, 10);
    console.log(`  contents: ${items.join(', ')}`);
  }
}
