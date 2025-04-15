// Comprehensive test for AngelOne scraper
const { spawn } = require('child_process');

console.log('Testing AngelOne support crawler...');

// Command to run the test
const cmd = 'npx';
const args = [
  'tsx', 
  '-e', 
  `
  import { scrapeAngelOneSupport } from './app/lib/scrapers/angelOneSupport.ts';
  
  async function testCrawler() {
    console.log('Starting AngelOne support crawler test...');
    console.log('This may take a few minutes depending on the number of pages found.');
    
    try {
      // Only scrape up to 5 pages to keep the test quick
      const results = await scrapeAngelOneSupport();
      
      console.log('✅ Crawl complete!');
      console.log(\`Successfully scraped \${results.length} pages\`);
      
      if (results.length > 0) {
        // Show sample of results
        console.log('\\nSample of scraped content:');
        results.slice(0, 3).forEach((result, index) => {
          console.log(\`\\n--- Result \${index + 1} ---\`);
          console.log(\`URL: \${result.url}\`);
          console.log(\`Title: \${result.title}\`);
          console.log(\`Content length: \${result.content.length} characters\`);
          console.log(\`Content preview: \${result.content.substring(0, 100)}...\`);
        });
      }
    } catch (error) {
      console.error('❌ Test failed with error:', error);
    }
  }
  
  testCrawler();
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