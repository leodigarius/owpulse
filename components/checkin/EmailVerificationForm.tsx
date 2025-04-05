'use client';

import { useState } from 'react';

interface EmailVerificationFormProps {
  onSuccess: (anonymousUserId: string) => void;
}

export default function EmailVerificationForm({ onSuccess }: EmailVerificationFormProps) {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState<'email' | 'token'>('email');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/checkin/request-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send verification code');
      }
      
      setMessage('Verification code sent to your email');
      setStep('token');
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/checkin/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify code');
      }
      
      // If verification successful, call the success callback with the anonymous user ID
      if (data.anonymousUserId) {
        onSuccess(data.anonymousUserId);
      } else {
        throw new Error('Authentication successful but no user ID received');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 mx-auto">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20">
        <h2 className="text-2xl font-bold text-center text-white mb-6">OW Email Verification</h2>
        
        {/* Email Form */}
        {step === 'email' && (
          <form onSubmit={handleRequestToken} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                Your Oliver Wyman Email Address
              </label>
              <input
                id="email"
                type="email"
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                placeholder="name@oliverwyman.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="mt-1 text-xs text-white/70">
                We'll send a verification code to this address
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-sm text-white">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Verification Code'}
            </button>
          </form>
        )}
        
        {/* Token Form */}
        {step === 'token' && (
          <form onSubmit={handleVerifyToken} className="space-y-4">
            {message && (
              <div className="p-3 bg-green-500/20 border border-green-500/40 rounded-lg text-sm text-white mb-4">
                {message}
              </div>
            )}
            
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-white mb-1">
                Enter Verification Code
              </label>
              <input
                id="token"
                type="text"
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                placeholder="6-digit code"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
              <p className="mt-1 text-xs text-white/70">
                Check your inbox for the verification code
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-sm text-white">
                {error}
              </div>
            )}

            <div className="flex flex-col space-y-2">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-70"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Verifying...' : 'Verify Code'}
              </button>
              
              <button
                type="button"
                className="text-sm text-white/70 hover:text-white"
                onClick={() => setStep('email')}
              >
                Back to Email Entry
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 