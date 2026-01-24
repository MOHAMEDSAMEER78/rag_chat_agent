import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getUserCredits } from '@/app/lib/credits';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const credits = await getUserCredits(userId);
    
    return NextResponse.json({ credits });
  } catch (error) {
    console.error('Error fetching credits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credits' },
      { status: 500 }
    );
  }
}
