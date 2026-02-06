const fs = require('fs');
const path = require('path');

// Script runs from /home/user/ which is where the project files are
const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'src');

console.log('rootDir:', rootDir);
console.log('srcDir:', srcDir);
console.log('srcDir exists:', fs.existsSync(srcDir));

function copyRecursive(srcPath, destPath) {
  const stat = fs.statSync(srcPath);
  
  if (stat.isDirectory()) {
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }
    const entries = fs.readdirSync(srcPath);
    for (const entry of entries) {
      copyRecursive(path.join(srcPath, entry), path.join(destPath, entry));
    }
  } else {
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (fs.existsSync(destPath)) {
      console.log('SKIP (exists): ' + destPath);
      return;
    }
    fs.copyFileSync(srcPath, destPath);
    console.log('COPIED: ' + path.relative(rootDir, srcPath) + ' -> ' + path.relative(rootDir, destPath));
  }
}

const dirsToMove = [
  'components',
  'contexts', 
  'hooks',
  'integrations',
  'lib',
  'pages',
  'types',
  'utils',
];

const filesToMove = [
  'App.tsx',
  'App.css',
];

for (const dir of dirsToMove) {
  const srcPath = path.join(srcDir, dir);
  const destPath = path.join(rootDir, dir);
  if (fs.existsSync(srcPath)) {
    console.log('Copying directory: ' + dir);
    copyRecursive(srcPath, destPath);
  } else {
    console.log('Directory not found: ' + dir);
  }
}

for (const file of filesToMove) {
  const srcPath = path.join(srcDir, file);
  const destPath = path.join(rootDir, file);
  if (fs.existsSync(srcPath)) {
    if (!fs.existsSync(destPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log('COPIED: ' + file);
    } else {
      console.log('SKIP (exists): ' + file);
    }
  }
}

console.log('Done! Files copied from src/ to root.');
