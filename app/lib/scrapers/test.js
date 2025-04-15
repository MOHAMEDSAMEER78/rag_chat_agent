// Test script for AngelOne scraper
const { spawn } = require('child_process');

console.log('Testing AngelOne scraper...');

// Command to run the test
const cmd = 'npx';
const args = [
  'tsx', // Using tsx as it's more compatible than ts-node
  '-e', 
  `
  import { scrapeAngelOnePage } from './app/lib/scrapers/angelOneSupport.ts';
  
  async function test() {
    console.log('Testing single page scraper...');
    const pageUrl = 'https://www.angelone.in/support';
    const result = await scrapeAngelOnePage(pageUrl);
    
    if (result) {
      console.log('Successfully scraped page:');
      console.log('URL:', result.url);
      console.log('Title:', result.title);
      console.log('Content length:', result.content.length, 'characters');
      console.log('Content preview:', result.content.substring(0, 150), '...');
    } else {
      console.log('Failed to scrape page:', pageUrl);
    }
  }
  
  test().catch(console.error);
  `
];

// Spawn the process
const process = spawn(cmd, args);

// Handle output
process.stdout.on('data', (data) => {
  console.log(data.toString());
});

process.stderr.on('data', (data) => {
  console.error(data.toString());
});

process.on('close', (code) => {
  console.log(`Process exited with code ${code}`);
}); 