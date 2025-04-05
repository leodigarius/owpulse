'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to homepage after 5 seconds
    const redirectTimeout = setTimeout(() => {
      router.push('/');
    }, 5000);

    return () => clearTimeout(redirectTimeout);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <img 
        src="/owpulse_logo.PNG" 
        alt="OWPulse Logo" 
        className="w-48 h-auto mb-8" 
      />
      <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
      <p className="text-lg mb-8 text-center">
        We couldn't find the page you were looking for. You'll be redirected to the homepage in 5 seconds.
      </p>
      <Link 
        href="/" 
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
      >
        Go to Homepage Now
      </Link>
    </div>
  );
} 