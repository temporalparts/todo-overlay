#!/usr/bin/env node

import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convertSvgToIcons() {
  const svgPath = path.join(__dirname, '../../tabula.svg');
  const publicDir = path.join(__dirname, '../public');
  
  // Required icon sizes for Chrome extensions
  const sizes = [16, 32, 48, 128];
  
  console.log('Converting SVG to PNG icons...');
  
  try {
    // Read the SVG file
    const svgBuffer = await fs.readFile(svgPath);
    
    // Create PNG icons for each size
    for (const size of sizes) {
      const outputPath = path.join(publicDir, `icon${size}.png`);
      
      await sharp(svgBuffer, { density: 300 })
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 } // transparent background
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Created ${outputPath}`);
    }
    
    console.log('✨ All icons created successfully!');
  } catch (error) {
    console.error('Error converting SVG to icons:', error);
    process.exit(1);
  }
}

convertSvgToIcons();