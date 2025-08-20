#!/usr/bin/env node

import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createStoreAssets() {
  const svgPath = path.join(__dirname, '../../tabula.svg');
  const screenshotPath = path.join(__dirname, '../../screenshot.png');
  const storeAssetsDir = path.join(__dirname, '../store-assets');
  
  console.log('Creating store assets directory...');
  
  try {
    // Create store-assets directory if it doesn't exist
    await fs.mkdir(storeAssetsDir, { recursive: true });
    
    // 1. Create Small Promotional Image (440x280) from SVG
    console.log('Creating small promotional image (440x280)...');
    const svgBuffer = await fs.readFile(svgPath);
    
    // Create a canvas with indigo background and centered logo
    await sharp({
      create: {
        width: 440,
        height: 280,
        channels: 4,
        background: { r: 79, g: 70, b: 229, alpha: 1 } // Indigo-600 color
      }
    })
    .composite([
      {
        input: await sharp(svgBuffer)
          .resize(200, 200, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .png()
          .toBuffer(),
        top: 40,
        left: 120
      }
    ])
    .png()
    .toFile(path.join(storeAssetsDir, 'small-promo-440x280.png'));
    
    console.log('✅ Created small-promo-440x280.png');
    
    // 2. Process screenshot for store listing
    console.log('Processing screenshot...');
    
    // Check if screenshot exists
    try {
      const screenshotBuffer = await fs.readFile(screenshotPath);
      
      // Get screenshot metadata
      const metadata = await sharp(screenshotBuffer).metadata();
      console.log(`Original screenshot dimensions: ${metadata.width}x${metadata.height}`);
      
      // Create 1280x800 version (preferred size)
      await sharp(screenshotBuffer)
        .resize(1280, 800, {
          fit: 'contain',
          background: { r: 245, g: 245, b: 245, alpha: 1 } // Light gray background
        })
        .png()
        .toFile(path.join(storeAssetsDir, 'screenshot-1280x800.png'));
      
      console.log('✅ Created screenshot-1280x800.png');
      
      // Also create a 640x400 version as backup
      await sharp(screenshotBuffer)
        .resize(640, 400, {
          fit: 'contain',
          background: { r: 245, g: 245, b: 245, alpha: 1 }
        })
        .png()
        .toFile(path.join(storeAssetsDir, 'screenshot-640x400.png'));
      
      console.log('✅ Created screenshot-640x400.png');
      
    } catch (screenshotError) {
      console.error('❌ Could not process screenshot.png:', screenshotError.message);
      console.log('Please ensure screenshot.png exists at the project root');
    }
    
    // 3. Create Marquee Promotional Image (1400x560) - Optional but recommended
    console.log('Creating marquee promotional image (1400x560)...');
    
    await sharp({
      create: {
        width: 1400,
        height: 560,
        channels: 4,
        background: { r: 79, g: 70, b: 229, alpha: 1 } // Indigo-600
      }
    })
    .composite([
      {
        input: await sharp(svgBuffer)
          .resize(280, 280, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .png()
          .toBuffer(),
        top: 140,
        left: 200
      },
      {
        input: Buffer.from(
          `<svg width="800" height="200">
            <text x="0" y="60" font-family="Arial, sans-serif" font-size="48" font-weight="300" fill="white">TABULA</text>
            <text x="0" y="120" font-family="Arial, sans-serif" font-size="24" fill="white" opacity="0.9">Take Back Your Life Again</text>
            <text x="0" y="170" font-family="Arial, sans-serif" font-size="18" fill="white" opacity="0.8">Transform digital distractions into productivity moments</text>
          </svg>`
        ),
        top: 200,
        left: 550
      }
    ])
    .png()
    .toFile(path.join(storeAssetsDir, 'marquee-promo-1400x560.png'));
    
    console.log('✅ Created marquee-promo-1400x560.png');
    
    console.log('\n✨ Store assets created successfully in:', storeAssetsDir);
    console.log('\nAssets created:');
    console.log('- small-promo-440x280.png (Required)');
    console.log('- screenshot-1280x800.png (Required - at least 1)');
    console.log('- screenshot-640x400.png (Alternative size)');
    console.log('- marquee-promo-1400x560.png (Optional but recommended)');
    
  } catch (error) {
    console.error('Error creating store assets:', error);
    process.exit(1);
  }
}

createStoreAssets();