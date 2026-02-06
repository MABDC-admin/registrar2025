import fs from 'fs';
import path from 'path';

const srcDir = path.resolve('src');
const rootDir = path.resolve('.');

function moveRecursive(srcPath, destPath) {
  const stat = fs.statSync(srcPath);
  
  if (stat.isDirectory()) {
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }
    const entries = fs.readdirSync(srcPath);
    for (const entry of entries) {
      moveRecursive(path.join(srcPath, entry), path.join(destPath, entry));
    }
  } else {
    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    // Don't overwrite existing root files (like package.json, tsconfig, etc.)
    if (fs.existsSync(destPath)) {
      console.log(`SKIP (exists): ${destPath}`);
      return;
    }
    fs.copyFileSync(srcPath, destPath);
    console.log(`MOVED: ${srcPath} -> ${destPath}`);
  }
}

// Directories to move from src/ to root
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

// Files to move from src/ to root
const filesToMove = [
  'App.tsx',
  'App.css',
];

for (const dir of dirsToMove) {
  const srcPath = path.join(srcDir, dir);
  const destPath = path.join(rootDir, dir);
  if (fs.existsSync(srcPath)) {
    console.log(`Moving directory: ${dir}`);
    moveRecursive(srcPath, destPath);
  }
}

for (const file of filesToMove) {
  const srcPath = path.join(srcDir, file);
  const destPath = path.join(rootDir, file);
  if (fs.existsSync(srcPath)) {
    if (!fs.existsSync(destPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`MOVED: ${srcPath} -> ${destPath}`);
    } else {
      console.log(`SKIP (exists): ${destPath}`);
    }
  }
}

console.log('\nDone! Files moved from src/ to root.');
