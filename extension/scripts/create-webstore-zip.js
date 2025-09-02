#!/usr/bin/env node

import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createWebstoreZip() {
  const distDir = path.join(__dirname, '../dist');
  const extensionDir = path.join(__dirname, '..');
  
  // Read version from package.json
  const packageJsonPath = path.join(extensionDir, 'package.json');
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
  const version = packageJson.version;
  
  const zipName = `tabula-extension-v${version}.zip`;
  const zipPath = path.join(extensionDir, zipName);
  
  try {
    // Check if dist directory exists
    await fs.access(distDir);
    
    // Remove existing zip if it exists
    try {
      await fs.unlink(zipPath);
      console.log(`🗑️  Removed existing ${zipName}`);
    } catch (e) {
      // File doesn't exist, that's fine
    }
    
    // Optional: Clean up old versioned zips
    const files = await fs.readdir(extensionDir);
    const oldZips = files.filter(f => f.startsWith('tabula-extension-v') && f.endsWith('.zip') && f !== zipName);
    if (oldZips.length > 0) {
      console.log(`🧹 Found ${oldZips.length} old version(s), keeping them for reference`);
      console.log(`   (${oldZips.join(', ')})`);
    }
    
    // Create the zip file
    console.log('📦 Creating Chrome Web Store zip...');
    
    // Change to dist directory and zip contents
    const { stdout, stderr } = await execAsync(
      `cd "${distDir}" && zip -r "${zipPath}" .`,
      { maxBuffer: 1024 * 1024 * 10 } // 10MB buffer
    );
    
    if (stderr && !stderr.includes('warning')) {
      console.error('Warning:', stderr);
    }
    
    // Get file size
    const stats = await fs.stat(zipPath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log(`✅ Created ${zipName} (${fileSizeInMB} MB)`);
    console.log(`📍 Location: ${zipPath}`);
    console.log('\n🚀 Ready to upload to Chrome Web Store!');
    console.log('   Visit: https://chrome.google.com/webstore/devconsole');
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('❌ Error: dist directory not found!');
      console.error('   Please run "npm run build" first.');
    } else {
      console.error('❌ Error creating zip:', error.message);
    }
    process.exit(1);
  }
}

// Run the script
createWebstoreZip();