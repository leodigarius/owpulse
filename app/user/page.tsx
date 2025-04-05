'use client';

// Page is now statically generated
// export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Step1_Mood from '@/components/checkin/Step1_Mood';
import Step2_Positives from '@/components/checkin/Step2_Positives';
import Step3_Negatives from '@/components/checkin/Step3_Negatives';
import Step4_Hours from '@/components/checkin/Step4_Hours';
import Step5_ThankYou from '@/components/checkin/Step5_ThankYou';
import Link from 'next/link';
import { ThemeToggleButton } from '@/components/ThemeToggleButton';

// Define the structure for the check-in data
interface CheckInData {
  overallMood: number | null;
  positiveAspects: string[];
  negativeAspects: string[];
  hoursWorked: number | null;
  comment: string;
  didNotWork: boolean;
  email: string;
  focusGroup: string; // Added focus group
}

const initialCheckInData: CheckInData = {
  overallMood: null,
  positiveAspects: [],
  negativeAspects: [],
  hoursWorked: null,
  comment: '',
  didNotWork: false,
  email: '',
  focusGroup: '', // Initialize focus group
};

export default function UserCheckinFlowPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [checkInData, setCheckInData] = useState<CheckInData>(initialCheckInData);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [anonymousUserId, setAnonymousUserId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Load/Generate Anonymous User ID on mount
  useEffect(() => {
    setMounted(true);
    const storedUserId = localStorage.getItem('owpulseAnonymousUserId');
    if (storedUserId) {
      setAnonymousUserId(storedUserId);
    } else {
      const newUserId = crypto.randomUUID();
      localStorage.setItem('owpulseAnonymousUserId', newUserId);
      setAnonymousUserId(newUserId);
    }
  }, []);

  const handleNext = () => {
    if (currentStep === 4) {
      handleSubmit();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleReset = () => {
    setCheckInData(initialCheckInData);
    setMessage('');
    setCurrentStep(1);
  };

  const setData = (field: keyof CheckInData, value: any) => {
    setCheckInData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!anonymousUserId) {
        setMessage('Error: Anonymous user ID not set.');
        return;
    }
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...checkInData,
          email: checkInData.email || null,
          anonymousUserId: anonymousUserId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Submission failed');
      }

      setMessage('Feedback submitted successfully!');
      setCurrentStep(5);

    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
      console.error('Submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to render the current step component
  const renderStep = () => {
    const stepProps = { data: checkInData, setData, onNext: handleNext, onBack: handleBack };
    switch (currentStep) {
      case 1:
        return <Step1_Mood {...stepProps} />;
      case 2:
        return <Step2_Positives {...stepProps} />;
      case 3:
        return <Step3_Negatives {...stepProps} />;
      case 4:
        return <Step4_Hours {...stepProps} />;
      case 5:
        return <Step5_ThankYou data={checkInData} onReset={handleReset} />;
      default:
        return <p>Invalid step</p>;
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Vibrant gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 dark:from-blue-900 dark:via-purple-800 dark:to-pink-900" />
      
      {/* Fixed position decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-300/30 dark:bg-blue-500/20 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-purple-300/20 dark:bg-purple-500/20 blur-3xl animate-pulse-slow"></div>
      <div className="absolute top-2/3 left-1/3 w-56 h-56 rounded-full bg-pink-300/20 dark:bg-pink-500/20 blur-3xl animate-pulse-slower"></div>
      
      {/* Fixed decorative blobs */}
      <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 opacity-20 dark:opacity-10 blur-xl"></div>
      <div className="absolute bottom-40 right-20 w-40 h-40 rounded-full bg-gradient-to-r from-green-400 to-teal-500 opacity-20 dark:opacity-10 blur-xl"></div>
      <div className="absolute top-40 right-40 w-24 h-24 rounded-full bg-gradient-to-r from-indigo-400 to-blue-500 opacity-20 dark:opacity-10 blur-xl"></div>

      {/* Header with Theme Toggle and Login - Fixed in top right */}
      <header className="fixed top-0 right-0 p-4 md:p-6 z-50 flex items-center gap-4">
        <ThemeToggleButton />
        <Link href="/api/auth/signin"
              className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-sm font-medium text-white hover:bg-white/30 transition-colors shadow-lg border border-white/10">
          Manager Login
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative flex min-h-screen flex-col items-center justify-center p-6 md:p-12 lg:p-24">
        {/* Progress Bar */}
        <div className="w-full max-w-2xl mb-6">
          <div className="w-full bg-gray-200/30 dark:bg-gray-700/30 h-2 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 transition-all duration-500 ease-in-out"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-white/70">
            <span>Mood</span>
            <span>Positives</span>
            <span>Challenges</span>
            <span>Hours</span>
            <span>Complete</span>
          </div>
        </div>

        {/* Glass Card Container */}
        <div className="w-full max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-2xl border border-white/20 transform transition-all duration-300">
          <h1 className="text-3xl font-bold text-center text-white mb-6">OW Pulse Check-in</h1>

          {/* Render the current step */}
          <div className="transition-all duration-500 ease-in-out text-white">
            {renderStep()}
          </div>

          {/* Loading and Message Display */}
          {isLoading && (
            <div className="flex justify-center items-center mt-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <p className="ml-3 text-white">Processing...</p>
            </div>
          )}
          
          {message && !isLoading && (
            <div className={`p-4 rounded-lg mt-6 ${message.startsWith('Error:') ? 'bg-red-400/20 text-red-100' : 'bg-green-400/20 text-green-100'}`}>
              <p className="text-center font-medium">{message}</p>
            </div>
          )}
        </div>
      </main>

      <footer className="absolute bottom-0 w-full text-center p-4 text-white/70 text-sm">
        <p>&copy; {new Date().getFullYear()} Oliver Wyman. All rights reserved.</p>
      </footer>

      {/* Client-side generated stars (rendered only after mount to avoid hydration issues) */}
      {mounted && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => {
            // Using a deterministic seed-based approach instead of pure Math.random()
            const position = ((i * 17) % 100);
            const size = ((i * 13) % 3) + 1;
            const delay = ((i * 7) % 5);
            const duration = ((i * 11) % 3) + 2;
            
            return (
              <div
                key={i}
                className="absolute rounded-full bg-white animate-twinkle"
                style={{
                  top: `${position}%`,
                  left: `${(position + 47) % 100}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  opacity: 0.7,
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`,
                  boxShadow: '0 0 4px 1px rgba(255, 255, 255, 0.8)',
                }}
              />
            );
          })}
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        
        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
} 