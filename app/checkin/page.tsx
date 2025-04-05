// owpulse/app/checkin/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CheckinForm from '@/components/checkin/CheckinForm';
import TokenForm from '@/components/checkin/TokenForm';

export default function CheckinPage() {
  const [token, setToken] = useState<string | null>(null);
  const [playerInfo, setPlayerInfo] = useState<any>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const router = useRouter();

  const handleTokenSubmit = async (submittedToken: string) => {
    try {
      // In static export mode, make direct API calls to Vercel's API router
      const response = await fetch(`${window.location.origin}/api/checkin/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: submittedToken }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to verify token');
      }

      const data = await response.json();
      setToken(submittedToken);
      setPlayerInfo(data.player);
      setVerificationError(null);
    } catch (error: any) {
      console.error('Token verification error:', error);
      setVerificationError(error.message || 'Failed to verify token');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto p-4">
        {!token ? (
          <TokenForm onSubmit={handleTokenSubmit} error={verificationError} />
        ) : (
          <CheckinForm playerInfo={playerInfo} token={token} />
        )}
      </div>
    </div>
  );
}
