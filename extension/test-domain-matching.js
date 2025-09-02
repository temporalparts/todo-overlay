#!/usr/bin/env node

// Test script for domain matching logic
import { matchesPattern, normalizeDomainPattern, validateDomainPattern } from './dist/lib/domain.js';

const tests = [
  // Root domain tests
  { url: 'https://google.com', pattern: 'google.com', expected: true, description: 'Root domain exact match' },
  { url: 'https://mail.google.com', pattern: 'google.com', expected: true, description: 'Root domain matches subdomain' },
  { url: 'https://docs.google.com', pattern: 'google.com', expected: true, description: 'Root domain matches any subdomain' },
  { url: 'https://calendar.google.com/calendar', pattern: 'google.com', expected: true, description: 'Root domain matches subdomain with path' },
  
  // Subdomain-specific tests
  { url: 'https://mail.google.com', pattern: 'mail.google.com', expected: true, description: 'Exact subdomain match' },
  { url: 'https://calendar.google.com', pattern: 'mail.google.com', expected: false, description: 'Different subdomain no match' },
  { url: 'https://inbox.mail.google.com', pattern: 'mail.google.com', expected: false, description: 'Deeper subdomain no match' },
  
  // Path tests
  { url: 'https://github.com/facebook/react', pattern: 'github.com/facebook', expected: true, description: 'Path prefix match' },
  { url: 'https://github.com/facebook', pattern: 'github.com/facebook', expected: true, description: 'Exact path match' },
  { url: 'https://github.com/google', pattern: 'github.com/facebook', expected: false, description: 'Different path no match' },
  { url: 'https://github.com', pattern: 'github.com/facebook', expected: false, description: 'Missing path no match' },
  
  // Subdomain with path tests
  { url: 'https://docs.google.com/spreadsheets', pattern: 'docs.google.com/spreadsheets', expected: true, description: 'Subdomain with path match' },
  { url: 'https://docs.google.com/document', pattern: 'docs.google.com/spreadsheets', expected: false, description: 'Same subdomain different path' },
  { url: 'https://drive.google.com/spreadsheets', pattern: 'docs.google.com/spreadsheets', expected: false, description: 'Different subdomain same path' },
  
  // Reddit tests
  { url: 'https://reddit.com/r/programming', pattern: 'reddit.com/r/programming', expected: true, description: 'Reddit subreddit match' },
  { url: 'https://www.reddit.com/r/programming/comments/123', pattern: 'reddit.com/r/programming', expected: true, description: 'Reddit with www and deeper path' },
  { url: 'https://old.reddit.com/r/programming', pattern: 'reddit.com/r/programming', expected: true, description: 'Old reddit subdomain with path' },
  { url: 'https://reddit.com/r/javascript', pattern: 'reddit.com/r/programming', expected: false, description: 'Different subreddit no match' },
  
  // Compound TLD tests  
  { url: 'https://bbc.co.uk', pattern: 'bbc.co.uk', expected: true, description: 'UK domain exact match' },
  { url: 'https://news.bbc.co.uk', pattern: 'bbc.co.uk', expected: true, description: 'UK domain matches subdomain' },
  { url: 'https://example.com.au', pattern: 'example.com.au', expected: true, description: 'Australian domain match' },
  { url: 'https://shop.example.com.au', pattern: 'example.com.au', expected: true, description: 'Australian domain subdomain match' },
  
  // Localhost tests
  { url: 'http://localhost:3000', pattern: 'localhost:3000', expected: true, description: 'Localhost with port match' },
  { url: 'http://localhost:3000/admin', pattern: 'localhost:3000', expected: true, description: 'Localhost with port and path' },
  { url: 'http://localhost:5000', pattern: 'localhost:3000', expected: false, description: 'Different port no match' },
  
  // WWW handling
  { url: 'https://www.example.com', pattern: 'example.com', expected: true, description: 'WWW stripped for matching' },
  { url: 'https://example.com', pattern: 'www.example.com', expected: true, description: 'Pattern WWW ignored' },
];

// Validation tests
const validationTests = [
  { input: 'google.com', expected: null, description: 'Valid domain' },
  { input: 'mail.google.com', expected: null, description: 'Valid subdomain' },
  { input: 'google.co.uk', expected: null, description: 'Valid compound TLD' },
  { input: 'github.com/facebook', expected: null, description: 'Valid domain with path' },
  { input: 'localhost:3000', expected: null, description: 'Valid localhost with port' },
  { input: 'https://google.com', expected: 'Please remove the protocol', description: 'Protocol rejection' },
  { input: 'http://example.com', expected: 'Please remove the protocol', description: 'HTTP protocol rejection' },
  { input: 'ftp://files.com', expected: 'Please remove the protocol', description: 'FTP protocol rejection' },
  { input: '', expected: 'Please enter a domain', description: 'Empty input' },
  { input: 'example.com/path/../etc', expected: 'Path cannot contain ".."', description: 'Path traversal rejection' },
];

console.log('Testing Domain Matching Logic\n');
console.log('==============================\n');

let passed = 0;
let failed = 0;

// Test pattern matching
console.log('Pattern Matching Tests:');
for (const test of tests) {
  const normalized = normalizeDomainPattern(test.pattern);
  const result = matchesPattern(test.url, normalized);
  const status = result === test.expected ? '✅' : '❌';
  
  if (result === test.expected) {
    passed++;
  } else {
    failed++;
    console.log(`${status} ${test.description}`);
    console.log(`   URL: ${test.url}`);
    console.log(`   Pattern: ${test.pattern}`);
    console.log(`   Expected: ${test.expected}, Got: ${result}\n`);
  }
}

console.log('\n==============================\n');
console.log('Validation Tests:');

// Test validation
for (const test of validationTests) {
  const result = validateDomainPattern(test.input);
  const matches = (result === null && test.expected === null) || 
                  (result && test.expected && result.includes(test.expected.substring(0, 20)));
  const status = matches ? '✅' : '❌';
  
  if (matches) {
    passed++;
  } else {
    failed++;
    console.log(`${status} ${test.description}`);
    console.log(`   Input: ${test.input}`);
    console.log(`   Expected: ${test.expected}`);
    console.log(`   Got: ${result}\n`);
  }
}

console.log('\n==============================\n');
console.log(`Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
}