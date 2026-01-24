'use client';

import { useEffect, useState } from 'react';
import { Coins } from 'lucide-react';

export default function CreditsDisplay() {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCredits = async () => {
    try {
      const response = await fetch('/api/credits');
      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits);
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
    
    // Refresh credits every 30 seconds
    const interval = setInterval(fetchCredits, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-md">
        <Coins className="h-4 w-4" />
        <span className="text-sm font-medium">...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-md">
      <Coins className="h-4 w-4" />
      <span className="text-sm font-medium">{credits ?? 0} Credits</span>
    </div>
  );
}
