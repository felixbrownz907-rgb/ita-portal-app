
import fs from 'fs';
import path from 'path';

function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        findFiles(filePath, fileList);
      }
    } else {
      if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        fileList.push(filePath);
      }
    }
  });
  return fileList;
}

const files = findFiles('./src');
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('Zap')) {
    const hasImport = content.includes("import {") && content.includes("Zap") && content.includes("from 'lucide-react'");
    const hasIconUsage = content.includes('<Zap') || content.includes('Icon={Zap}') || content.includes('icon: Zap');
    
    if (hasIconUsage && !hasImport) {
      console.log(`ERROR: ${file} uses Zap but might be missing import.`);
    } else if (hasIconUsage) {
      // console.log(`OK: ${file} correctly imports Zap.`);
    }
  }
});
