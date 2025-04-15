import { scrapeAngelOnePage, scrapeAngelOneSupport } from './angelOneSupport';

async function testSinglePage() {
  console.log('Testing single page scraper...');
  const pageUrl = 'https://www.angelone.in/support';
  const result = await scrapeAngelOnePage(pageUrl);
  
  if (result) {
    console.log('Successfully scraped page:');
    console.log(`URL: ${result.url}`);
    console.log(`Title: ${result.title}`);
    console.log(`Content length: ${result.content.length} characters`);
    console.log(`Content preview: ${result.content.substring(0, 150)}...`);
  } else {
    console.log(`Failed to scrape page: ${pageUrl}`);
  }
}

async function testSupportCrawler() {
  console.log('Testing support page crawler (this may take a while)...');
  const results = await scrapeAngelOneSupport();
  
  console.log(`Total pages scraped: ${results.length}`);
  
  if (results.length > 0) {
    // Display sample of results
    console.log('Sample of scraped content:');
    results.slice(0, 3).forEach((result, index) => {
      console.log(`\n--- Result ${index + 1} ---`);
      console.log(`URL: ${result.url}`);
      console.log(`Title: ${result.title}`);
      console.log(`Content length: ${result.content.length} characters`);
      console.log(`Content preview: ${result.content.substring(0, 100)}...`);
    });
  }
}

// Run the test
testSinglePage()
  .then(() => console.log('Test complete'))
  .catch(err => console.error('Test failed:', err)); 