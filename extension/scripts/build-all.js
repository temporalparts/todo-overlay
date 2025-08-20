import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

async function build() {
  console.log('🔨 Building extension...');
  
  // Clean dist folder
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true });
  }
  
  // Type check
  console.log('📝 Type checking...');
  await execAsync('tsc --noEmit');
  
  // Build content script as IIFE
  console.log('📦 Building content script...');
  await execAsync('vite build --config vite.content.config.ts');
  
  // Build other scripts
  console.log('📦 Building background, popup, and options...');
  await execAsync('vite build --config vite.others.config.ts');
  
  console.log('✅ Build complete!');
}

build().catch(console.error);