const fs = require('fs');
const path = require('path');

console.log('__dirname:', __dirname);
console.log('cwd:', process.cwd());

const projectRoot = '/vercel/share/v0-project';
const srcDir = path.join(projectRoot, 'src');

console.log('Checking srcDir:', srcDir);
console.log('srcDir exists:', fs.existsSync(srcDir));

if (fs.existsSync(srcDir)) {
  const entries = fs.readdirSync(srcDir);
  console.log('src/ contents:', entries);
  
  for (const entry of entries) {
    const entryPath = path.join(srcDir, entry);
    const stat = fs.statSync(entryPath);
    console.log(`  ${entry} (${stat.isDirectory() ? 'dir' : 'file'})`);
  }
} else {
  // Try to find src elsewhere
  console.log('Project root contents:', fs.readdirSync(projectRoot));
  
  // Check if cwd has src
  const cwdSrc = path.join(process.cwd(), 'src');
  console.log('cwd src exists:', fs.existsSync(cwdSrc));
  if (fs.existsSync(cwdSrc)) {
    console.log('cwd src contents:', fs.readdirSync(cwdSrc));
  }
}
