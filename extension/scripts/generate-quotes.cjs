#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read and parse CSV
const csvPath = path.join(__dirname, '..', 'inspiring-quotes.csv');
const outputPath = path.join(__dirname, '..', 'src', 'data', 'quotes.ts');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'src', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Read CSV file
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n').filter(line => line.trim());

// Skip header and parse quotes
const quotes = [];
for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  // Simple CSV parsing - handles quotes and commas in fields
  const matches = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
  
  if (matches && matches.length >= 2) {
    // Clean up the fields
    const text = matches[0].replace(/^"|"$/g, '').trim();
    const author = matches[1].replace(/^"|"$/g, '').trim();
    
    // Skip empty entries
    if (text && author) {
      quotes.push({
        text: text.replace(/'/g, "\\'").replace(/"/g, '\\"'),
        author: author.replace(/'/g, "\\'").replace(/"/g, '\\"')
      });
    }
  }
}

// Generate TypeScript file
const tsContent = `// This file is auto-generated from inspiring-quotes.csv
// Run 'npm run generate-quotes' to regenerate

export interface Quote {
  text: string;
  author: string;
}

export const quotes: Quote[] = [
${quotes.map(q => `  {
    text: "${q.text}",
    author: "${q.author}"
  }`).join(',\n')}
];

// Helper function to get a random quote
export function getRandomQuote(): Quote {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

// Helper function to get a shuffled array of quotes
export function getShuffledQuotes(): Quote[] {
  const shuffled = [...quotes];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
`;

// Write to file
fs.writeFileSync(outputPath, tsContent);

console.log(`✅ Generated ${quotes.length} quotes in ${outputPath}`);
console.log('📝 You can regenerate this file anytime by running: npm run generate-quotes');