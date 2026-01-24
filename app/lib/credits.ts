import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'app/data');
const CREDITS_FILE = path.join(DATA_DIR, 'user-credits.json');
const DEFAULT_CREDITS = 5;

export interface UserCredits {
  [userId: string]: number;
}

// Ensure the data directory and credits file exist
async function ensureCreditsFile(): Promise<void> {
  try {
    // Create data directory if it doesn't exist
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    // Check if file exists
    await fs.access(CREDITS_FILE);
  } catch {
    // File doesn't exist, create it with empty object
    await fs.writeFile(CREDITS_FILE, JSON.stringify({}));
  }
}

// Read all user credits
async function readCredits(): Promise<UserCredits> {
  await ensureCreditsFile();
  try {
    const data = await fs.readFile(CREDITS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error parsing credits file:', error);
    // If JSON is corrupted, reset to empty object
    await fs.writeFile(CREDITS_FILE, JSON.stringify({}));
    return {};
  }
}

// Write user credits with basic locking mechanism
let writeLock = Promise.resolve();

async function writeCredits(credits: UserCredits): Promise<void> {
  // Wait for any pending write to complete
  await writeLock;
  
  // Create a new lock for this write
  writeLock = (async () => {
    await fs.writeFile(CREDITS_FILE, JSON.stringify(credits, null, 2));
  })();
  
  await writeLock;
}

// Get credits for a specific user
export async function getUserCredits(userId: string): Promise<number> {
  const credits = await readCredits();
  
  // If user doesn't exist, initialize with default credits
  if (credits[userId] === undefined) {
    credits[userId] = DEFAULT_CREDITS;
    await writeCredits(credits);
    return DEFAULT_CREDITS;
  }
  
  return credits[userId];
}

// Deduct credits from a user
export async function deductCredits(userId: string, amount: number = 1): Promise<number> {
  const credits = await readCredits();
  
  // Initialize if needed
  if (credits[userId] === undefined) {
    credits[userId] = DEFAULT_CREDITS;
  }
  
  // Deduct credits
  credits[userId] = Math.max(0, credits[userId] - amount);
  await writeCredits(credits);
  
  return credits[userId];
}

// Add credits to a user
export async function addCredits(userId: string, amount: number): Promise<number> {
  const credits = await readCredits();
  
  // Initialize if needed
  if (credits[userId] === undefined) {
    credits[userId] = DEFAULT_CREDITS;
  }
  
  credits[userId] += amount;
  await writeCredits(credits);
  
  return credits[userId];
}
