// owpulse/app/checkin/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Step1_Mood from '@/components/checkin/Step1_Mood';
import Step2_Positives from '@/components/checkin/Step2_Positives';
import Step3_Negatives from '@/components/checkin/Step3_Negatives';
import Step4_Hours from '@/components/checkin/Step4_Hours';
import Step5_ThankYou from '@/components/checkin/Step5_ThankYou';
import Link from 'next/link';
import { ThemeToggleButton } from '@/components/ThemeToggleButton';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Input } from '@/components/ui/input'; // Assuming Input component exists
import { Label } from '@/components/ui/label'; // Assuming Label component exists

// Define the structure for the check-in data
interface CheckInData {
  overallMood: number | null;
  positiveAspects: string[];
  negativeAspects: string[];
  hoursWorked: number | null;
  comment: string;
  didNotWork: boolean;
  // email: string; // Email is handled separately now
  focusGroup: string; // Added focus group
}

const initialCheckInData: Omit<CheckInData, 'email'> = { // Omit email from initial data
  overallMood: null,
  positiveAspects: [],
  negativeAspects: [],
  hoursWorked: null,
  comment: '',
  didNotWork: false,
  focusGroup: '', // Initialize focus group
};

type VerificationStep = 'enterEmail' | 'enterToken' | 'verified' | 'thankYou';

export default function CheckinPage() {
  const [currentCheckinStep, setCurrentCheckinStep] = useState(1);
  const [checkInData, setCheckInData] = useState<Omit<CheckInData, 'email'>>(initialCheckInData);
  const [isLoading, setIsLoading] = useState(false); // For submission loading
  const [message, setMessage] = useState(''); // For submission result message
  const [anonymousUserId, setAnonymousUserId] = useState<string | null>(null); // Set after verification
  const [mounted, setMounted] = useState(false);

  // --- Verification States ---
  const [verificationStep, setVerificationStep] = useState<VerificationStep>('enterEmail');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false); // For verification loading
  const [verificationError, setVerificationError] = useState<string | null>(null);
  // ---

  useEffect(() => {
    setMounted(true);
    // Removed local storage logic for anonymousUserId
  }, []);

  // --- Verification Handlers ---
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.endsWith('@oliverwyman.com')) {
      setVerificationError('Please enter a valid @oliverwyman.com email address.');
      return;
    }
    setIsVerifying(true);
    setVerificationError(null);
    setMessage('');

    try {
      const response = await fetch('/api/checkin/request-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to request token. Please try again.' }));
        throw new Error(errorData.message || 'Failed to request token.');
      }

      // Token request successful, move to token entry step
      setVerificationStep('enterToken');

    } catch (error: any) {
      console.error('Request token error:', error);
      setVerificationError(error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleTokenSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!token || token.length !== 6) { // Assuming 6-digit token
       setVerificationError('Please enter the 6-digit code sent to your email.');
       return;
     }
     setIsVerifying(true);
     setVerificationError(null);
     setMessage('');

     try {
       const response = await fetch('/api/checkin/verify-token', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ email, token }),
       });

       if (!response.ok) {
         const errorData = await response.json().catch(() => ({ message: 'Invalid or expired token. Please try again.' }));
         throw new Error(errorData.message || 'Token verification failed.');
       }

       const data = await response.json();
       if (data.success && data.anonymousUserId) {
         setAnonymousUserId(data.anonymousUserId); // Store the verified user ID
         setVerificationStep('verified'); // Move to the actual check-in
         setCurrentCheckinStep(1); // Start check-in from step 1
         setCheckInData(initialCheckInData); // Reset check-in data
       } else {
         throw new Error('Verification failed. Please check the token and try again.');
       }

     } catch (error: any) {
       console.error('Verify token error:', error);
       setVerificationError(error.message);
     } finally {
       setIsVerifying(false);
     }
  };

  const handleGoBackToEmail = () => {
      setVerificationStep('enterEmail');
      setToken('');
      setVerificationError(null);
  };
  // --- End Verification Handlers ---


  // --- Check-in Step Handlers ---
  const handleNext = () => {
    if (verificationStep !== 'verified') return; // Only allow navigation if verified

    if (currentCheckinStep === 3) { // Step 3: Challenges
      if (checkInData.didNotWork) {
        const updatedNegativeAspects = checkInData.negativeAspects.includes("Did Not Work")
          ? checkInData.negativeAspects
          : [...checkInData.negativeAspects, "Did Not Work"];
        setCheckInData(prev => ({
          ...prev,
          negativeAspects: updatedNegativeAspects,
          hoursWorked: null
        }));
        handleSubmit(); // Submit directly after challenges if didn't work
      } else {
        setCurrentCheckinStep(prev => prev + 1); // Go to Hours step
      }
    } else if (currentCheckinStep === 4) { // Step 4: Hours
      handleSubmit(); // Submit after hours step
    } else {
      setCurrentCheckinStep(prev => prev + 1); // Normal progression
    }
  };

  const handleBack = () => {
    if (verificationStep !== 'verified') return;
    setCurrentCheckinStep(prev => Math.max(1, prev - 1));
  };

  const handleReset = () => {
    setCheckInData(initialCheckInData);
    setMessage('');
    setVerificationStep('enterEmail'); // Go back to email step on reset
    setCurrentCheckinStep(1);
    setEmail('');
    setToken('');
    setVerificationError(null);
    setAnonymousUserId(null);
  };

  const setData = (field: keyof Omit<CheckInData, 'email'>, value: any) => {
    if (field === 'focusGroup' && typeof value !== 'string') {
      console.error("Invalid type for focusGroup:", value);
      return;
    }
    setCheckInData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!anonymousUserId) { // Check if user is verified
        setMessage('Error: User not verified. Please complete email verification.');
        setVerificationStep('enterEmail'); // Send back to email step
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
          anonymousUserId: anonymousUserId, // Use the verified ID
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Submission failed' }));
        throw new Error(errorData.message || 'Submission failed');
      }

      setMessage('Feedback submitted successfully!');
      setVerificationStep('thankYou'); // Go to thank you step

    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
      console.error('Submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  // --- End Check-in Step Handlers ---


  // --- Render Functions ---
  const renderVerificationStep = () => {
    if (verificationStep === 'enterEmail') {
      return (
        <form onSubmit={handleEmailSubmit} className="space-y-4 animate-fade-in-up">
          <Heading size="h3" align="center" className="mb-4">Enter Your Email</Heading>
          <p className="text-center text-muted-foreground text-sm mb-6">
            Please enter your @oliverwyman.com email address to start your check-in.
          </p>
          <div>
            <Label htmlFor="email" className="sr-only">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.name@oliverwyman.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
              className="text-center"
              disabled={isVerifying}
            />
          </div>
          {verificationError && <p className="text-sm text-red-600 dark:text-red-400 text-center">{verificationError}</p>}
          <Button type="submit" className="w-full" disabled={isVerifying}>
            {isVerifying ? 'Sending Code...' : 'Send Verification Code'}
          </Button>
        </form>
      );
    }

    if (verificationStep === 'enterToken') {
      return (
        <form onSubmit={handleTokenSubmit} className="space-y-4 animate-fade-in-up">
           <Heading size="h3" align="center" className="mb-4">Enter Verification Code</Heading>
           <p className="text-center text-muted-foreground text-sm mb-6">
             A 6-digit code was sent to <strong>{email}</strong>. Please enter it below.
           </p>
          <div>
            <Label htmlFor="token" className="sr-only">Verification Code</Label>
            <Input
              id="token"
              type="text"
              placeholder="######"
              value={token}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))} // Allow only digits, max 6
              required
              maxLength={6}
              className="text-center tracking-[0.3em]" // Add tracking for better digit spacing
              disabled={isVerifying}
            />
          </div>
          {verificationError && <p className="text-sm text-red-600 dark:text-red-400 text-center">{verificationError}</p>}
          <div className="flex flex-col sm:flex-row gap-2">
             <Button type="button" variant="outline" onClick={handleGoBackToEmail} className="flex-1" disabled={isVerifying}>
                Back to Email
             </Button>
             <Button type="submit" className="flex-1" disabled={isVerifying}>
                {isVerifying ? 'Verifying...' : 'Verify Code'}
             </Button>
          </div>
        </form>
      );
    }

    return null; // Should not happen if logic is correct
  };

  // Render the current check-in step component
  const renderCheckinStep = () => {
    // Pass the current checkInData (which omits email) and handlers
    // Child components might need their prop types adjusted if they strictly require the full CheckInData type including email
    const stepProps = { data: checkInData, setData, onNext: handleNext, onBack: handleBack }; // Pass data without email
    switch (currentCheckinStep) {
      case 1: return <Step1_Mood {...stepProps} />;
      case 2: return <Step2_Positives {...stepProps} />;
      case 3: return <Step3_Negatives {...stepProps} />;
      case 4: return <Step4_Hours {...stepProps} />;
      // Step 5 (Thank You) is handled by verificationStep state now
      default: return <p>Invalid check-in step</p>;
    }
  };

  const renderProgressBar = () => {
      if (verificationStep !== 'verified') return null; // Don't show progress bar during verification

      const totalCheckinSteps = 4; // Mood, Positives, Negatives, Hours
      const progressPercent = (currentCheckinStep / totalCheckinSteps) * 100;

      return (
        <div className="w-full max-w-2xl mb-10 animate-fade-in-up">
          <div className="w-full bg-white/20 dark:bg-slate-800/30 h-3 rounded-full overflow-hidden backdrop-blur-sm shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          {/* Simplified step indicators */}
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
             <span>Mood</span>
             <span>Positives</span>
             <span>Challenges</span>
             <span>Hours</span>
             <span>Submit</span>
          </div>
        </div>
      );
  };
  // --- End Render Functions ---


  if (!mounted) {
      // Avoid rendering anything complex before hydration
      return <div className="min-h-screen bg-background"></div>;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Background elements */}
      <div className="fixed inset-0 z-[-2]">
        <div className="custom-bg-mesh-light dark:custom-bg-mesh-dark absolute inset-0 z-[-1] opacity-70"></div>
      </div>
      <div className="fixed top-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-blue-600/10 dark:bg-blue-600/5 blur-[100px] z-[-1] animate-pulse-slow"></div>
      <div className="fixed bottom-[15%] left-[5%] w-[350px] h-[350px] rounded-full bg-violet-600/10 dark:bg-violet-600/5 blur-[100px] z-[-1] animate-pulse-slow animation-delay-300"></div>
      <div className="fixed top-[10%] left-[20%] w-[300px] h-[300px] rounded-full bg-indigo-600/10 dark:bg-indigo-600/5 blur-[80px] z-[-1] animate-pulse-slow animation-delay-500"></div>

      {/* Header */}
      <header className="fixed top-0 right-0 p-4 md:p-6 z-50 flex items-center gap-4">
        <ThemeToggleButton />
        {/* Keep Manager Login for now, might be removed later */}
        <Link href="/api/auth/signin">
          <Button variant="glass" size="sm" rounded="full" className="px-5 group transition-all duration-300 animate-fade-in-up">
             {/* Icon */}
            Manager Login
          </Button>
        </Link>
      </header>

      {/* Main Content */}
      <Container className="relative min-h-screen flex flex-col items-center justify-center p-6">
         {/* Back link - only show if verified and not on step 1 */}
         {verificationStep === 'verified' && currentCheckinStep > 1 && (
            <div className="absolute top-8 left-8 z-10 animate-fade-in-up">
                <Button variant="glass" size="sm" onClick={handleBack} className="group flex items-center">
                    {/* Back Icon */}
                    Back
                </Button>
            </div>
         )}

        {/* Progress Bar */}
        {renderProgressBar()}

        {/* Main Card */}
        <Card
          variant="glass"
          padding="lg"
          radius="lg"
          className="w-full max-w-2xl mx-auto border border-white/20 dark:border-slate-700/30 shadow-xl animate-fade-in-up backdrop-blur-md"
        >
          <div className="relative">
            {/* Decorative elements */}
            <div className="absolute -top-10 -left-10 w-20 h-20 rounded-full bg-blue-500/10 blur-2xl"></div>
            <div className="absolute -bottom-10 -right-10 w-20 h-20 rounded-full bg-violet-500/10 blur-2xl"></div>

            {/* Conditional Rendering: Verification or Check-in */}
            {verificationStep === 'verified' ? (
                // Render Check-in Steps
                <>
                    <Heading size="h2" variant="gradient" align="center" className="mb-4 animate-fade-in-up">
                        Weekly Wellbeing Check-In
                    </Heading>
                    <div
                        className="transition-all duration-500 ease-in-out transform"
                        style={{ opacity: isLoading ? 0.7 : 1, filter: isLoading ? 'blur(2px)' : 'none' }}
                    >
                        {renderCheckinStep()}
                    </div>
                </>
            ) : verificationStep === 'thankYou' ? (
                 // Render Thank You Step
                 <Step5_ThankYou data={checkInData} onReset={handleReset} />
            ) : (
                 // Render Verification Steps
                 renderVerificationStep()
            )}


            {/* Loading indicator for Submission */}
            {isLoading && (
              <div className="absolute inset-0 flex flex-col justify-center items-center bg-slate-900/20 backdrop-blur-sm rounded-xl z-10 animate-fade-in-up">
                 {/* Spinner */}
                 <p className="mt-4 text-lg font-medium text-slate-700 dark:text-slate-300">Processing Submission...</p>
              </div>
            )}

            {/* Message Display for Submission */}
            {message && !isLoading && verificationStep !== 'thankYou' && ( // Don't show submit message on thank you step
              <div
                className={`p-5 rounded-xl mt-8 backdrop-blur-sm animate-fade-in-up ${
                  message.startsWith('Error:')
                    ? 'bg-red-500/15 text-red-600 dark:text-red-300 border border-red-500/30'
                    : 'bg-green-500/15 text-green-600 dark:text-green-300 border border-green-500/30'
                }`}
              >
                 {/* Message content */}
                 <p className="font-medium">{message}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Footer */}
        <footer className="text-center py-8 mt-auto w-full text-slate-600 dark:text-slate-400 text-sm animate-fade-in-up opacity-0 animation-delay-700">
          {/* Footer content */}
        </footer>
      </Container>
    </div>
  );
}
