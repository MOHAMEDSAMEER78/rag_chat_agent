import fs from 'fs/promises';
import path from 'path';

const CREDITS_FILE = path.join(process.cwd(), 'app/data/user-credits.json');
const DEFAULT_CREDITS = 5;

export interface UserCredits {
  [userId: string]: number;
}

// Ensure the credits file exists
async function ensureCreditsFile(): Promise<void> {
  try {
    await fs.access(CREDITS_FILE);
  } catch {
    // File doesn't exist, create it with empty object
    await fs.writeFile(CREDITS_FILE, JSON.stringify({}));
  }
}

// Read all user credits
async function readCredits(): Promise<UserCredits> {
  await ensureCreditsFile();
  const data = await fs.readFile(CREDITS_FILE, 'utf-8');
  return JSON.parse(data);
}

// Write user credits
async function writeCredits(credits: UserCredits): Promise<void> {
  await fs.writeFile(CREDITS_FILE, JSON.stringify(credits, null, 2));
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
