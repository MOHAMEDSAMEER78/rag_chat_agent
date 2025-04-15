import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapeResult {
  url: string;
  title: string;
  content: string;
}

// Function to extract text content from a single page
async function scrapePage(url: string): Promise<ScrapeResult | null> {
  try {
    console.log(`Scraping: ${url}`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });
    const $ = cheerio.load(response.data);
    
    // Extract the page title
    const title = $('title').text().trim();
    
    // Try multiple selector patterns to find the main content
    // Use a broader set of selectors based on the website's structure
    const mainContentSelectors = [
      '.support-content', '.faq-content', 'article', '.main-content',
      '.content', '.ai-raw-content', '.ann-content', '.dialog-content',
      'main', '#main', '.main', '#content', '.page-content',
      '.entry-content', '.tab-content', '.site-content'
    ];
    
    let mainContent;
    for (const selector of mainContentSelectors) {
      const element = $(selector).first();
      if (element.length) {
        mainContent = element;
        console.log(`Found content using selector: ${selector}`);
        break;
      }
    }
    
    // If no structured content is found, try the body as a fallback
    if (!mainContent || !mainContent.length) {
      console.log(`No content found with specific selectors for ${url}, using body fallback`);
      mainContent = $('body');
      
      // If still no content, return null
      if (!mainContent.length) {
        console.log(`No content found at ${url}`);
        return null;
      }
    }

    // Remove unnecessary elements
    mainContent.find('script, style, nav, footer, header, .sidebar, .navigation, .menu, .banner, .advert, .cookie-notice').remove();
    
    // Extract and clean the text content
    let content = mainContent.text()
      .replace(/\s+/g, ' ')
      .trim();
    
    // If content is too short, try extracting paragraphs and headings
    if (content.length < 50) {
      console.log(`Short content detected at ${url}, trying to extract paragraphs`);
      const paragraphs = $('p, h1, h2, h3, h4, h5, h6, li').map((_, el) => $(el).text().trim()).get();
      content = paragraphs.join(' ').replace(/\s+/g, ' ').trim();
    }
    
    // Check if we have enough content
    if (content.length < 30) {
      console.log(`Insufficient content length for ${url}: ${content.length} characters`);
      return null;
    }
    
    return { url, title, content };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return null;
  }
}

// Function to discover and extract links from the support page
async function extractSupportLinks(baseUrl: string = 'https://www.angelone.in/support'): Promise<string[]> {
  try {
    const response = await axios.get(baseUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });
    const $ = cheerio.load(response.data);
    const links: string[] = [];
    
    // Find all links on the support page - with improved selector coverage
    $('a').each((_, element) => {
      const href = $(element).attr('href');
      if (href && 
          (href.includes('/support') || 
           href.includes('/faq') || 
           href.includes('/help') || 
           href.includes('/knowledge-base')) && 
          !href.includes('#')) {
        
        // Ensure absolute URLs
        let fullUrl = href;
        if (!href.startsWith('http')) {
          if (href.startsWith('/')) {
            fullUrl = `https://www.angelone.in${href}`;
          } else {
            fullUrl = `https://www.angelone.in/${href}`;
          }
        }
        
        if (!links.includes(fullUrl)) {
          links.push(fullUrl);
        }
      }
    });
    
    console.log(`Extracted ${links.length} links from ${baseUrl}`);
    
    return links;
  } catch (error) {
    console.error(`Error extracting support links from ${baseUrl}:`, error);
    return [];
  }
}

// Main function to crawl and scrape all support pages
export async function scrapeAngelOneSupport(
  baseUrl: string = 'https://www.angelone.in/support'
): Promise<ScrapeResult[]> {
  // First, get all links from the support page
  const supportLinks = await extractSupportLinks(baseUrl);
  console.log(`Found ${supportLinks.length} support pages to scrape`);
  
  // Make sure we include the base URL if it's not already in the list
  if (!supportLinks.includes(baseUrl)) {
    supportLinks.unshift(baseUrl);
  }
  
  // Scrape each page with better error handling and retry logic
  const results: ScrapeResult[] = [];
  const failedUrls: string[] = [];
  
  for (const link of supportLinks) {
    try {
      // Try up to 3 times to scrape each page
      let pageResult = null;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!pageResult && attempts < maxAttempts) {
        attempts++;
        if (attempts > 1) {
          console.log(`Retry attempt ${attempts} for ${link}`);
          // Increase delay for each retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
        
        pageResult = await scrapePage(link);
      }
      
      if (pageResult && pageResult.content.length > 50) {
        // Only include pages with substantial content
        results.push(pageResult);
        console.log(`Successfully scraped: ${link} (${pageResult.content.length} chars)`);
      } else {
        failedUrls.push(link);
        console.log(`Failed to extract meaningful content from: ${link}`);
      }
    } catch (error) {
      failedUrls.push(link);
      console.error(`Error processing ${link}:`, error);
    }
    
    // Add a small delay to avoid overwhelming the server - dynamically adjusted
    const delay = Math.floor(Math.random() * 1000) + 500; // 500-1500ms
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  console.log(`Scraping complete. Successfully scraped ${results.length} pages.`);
  if (failedUrls.length > 0) {
    console.log(`Failed to scrape ${failedUrls.length} pages:`, failedUrls);
  }
  
  return results;
}

// Optional: A simpler function to just scrape a single page
export async function scrapeAngelOnePage(url: string): Promise<ScrapeResult | null> {
  return await scrapePage(url);
} 