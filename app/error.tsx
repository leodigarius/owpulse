'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <img 
        src="/owpulse_logo.PNG" 
        alt="OWPulse Logo" 
        className="w-48 h-auto mb-8" 
      />
      <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
      <p className="text-lg mb-8 text-center">
        We apologize for the inconvenience. Please try again or return to the homepage.
      </p>
      <div className="flex space-x-4">
        <button
          onClick={reset}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
        >
          Try again
        </button>
        <Link 
          href="/" 
          className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition-colors"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
} 