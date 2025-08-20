// Script to wrap content script in IIFE to avoid ES module issues
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const contentPath = path.join(__dirname, '../dist/content/inject.js');

if (fs.existsSync(contentPath)) {
  let content = fs.readFileSync(contentPath, 'utf8');
  
  // Wrap in IIFE if it starts with import
  if (content.startsWith('import')) {
    content = `(function() {\n${content}\n})();`;
  }
  
  fs.writeFileSync(contentPath, content);
  console.log('Content script wrapped in IIFE');
}