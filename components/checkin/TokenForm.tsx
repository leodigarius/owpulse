'use client';

import { useState } from 'react';

interface TokenFormProps {
  onSubmit: (token: string) => Promise<void>;
  error: string | null;
}

export default function TokenForm({ onSubmit, error }: TokenFormProps) {
  const [token, setToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(token);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-2rem)]">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-lg">
        <img 
          src="/owpulse_logo.PNG" 
          alt="OWPulse Logo" 
          className="w-48 h-auto mx-auto mb-8" 
        />
        
        <h1 className="text-2xl font-bold text-center mb-6">Player Check-In</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="token" className="block text-sm font-medium mb-2">
              Enter your check-in token
            </label>
            <input
              id="token"
              type="text"
              className="w-full p-3 bg-gray-700 rounded-md border border-gray-600 text-white"
              placeholder="Enter your token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-900/50 border border-red-800 rounded-md text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-70"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Verifying...' : 'Submit Token'}
          </button>
        </form>
      </div>
    </div>
  );
} 