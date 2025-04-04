'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react'; // Import useSession
import { useRouter } from 'next/navigation'; // Import useRouter
import { ThemeToggleButton } from '@/components/ThemeToggleButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { Heading } from '@/components/ui/heading';
import { Background } from '@/components/ui/background';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession(); // Get session data and status
  const router = useRouter(); // Get router instance

  // Only render client-side dynamic content after mount
  useEffect(() => {
    setMounted(true);

    // Redirect based on session status and role once session is loaded
    if (status === 'authenticated') {
      if (session?.user?.role === 'ADMIN') {
        router.replace('/admin'); // Redirect Admin to /admin
      } else if (session?.user?.role === 'MANAGER') {
        router.replace('/manager'); // Redirect Manager to /manager
      }
      // Regular users (or those without specific roles) stay on the landing page
    }
    // No redirect needed if status is 'loading' or 'unauthenticated' yet
  }, [session, status, router]);

  // Show loading state or null while session is loading or redirecting
  if (status === 'loading' || (status === 'authenticated' && session?.user?.role && ['ADMIN', 'MANAGER'].includes(session.user.role))) {
    // You might want a more sophisticated loading indicator here
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Only render the main page content if the user is unauthenticated
  // or authenticated but not an Admin/Manager (or if mounted hasn't run yet, though unlikely with the loading check)
  if (!mounted || status === 'unauthenticated' || (status === 'authenticated' && !['ADMIN', 'MANAGER'].includes(session?.user?.role || ''))) {
    // Render the landing page content
  } else {
    // Should ideally be covered by the loading state, but return null as a fallback
    return null;
  }

  // Render the landing page content only if conditions above are met
  return (
    <>
      {/* Background Elements Re-added */}
      {/* Background with mesh and stars */}
      <div className="fixed inset-0 z-[-2]">
        <div className="custom-bg-mesh-light dark:custom-bg-mesh-dark absolute inset-0 z-[-1]"></div>
        {/* Removed static stars.png background */}
      </div>
      {/* Decorative circles */}
      <div className="fixed top-[10%] right-[15%] w-[300px] h-[300px] rounded-full bg-blue-600/10 dark:bg-blue-600/5 blur-3xl z-[-1]"></div>
      <div className="fixed bottom-[15%] left-[10%] w-[250px] h-[250px] rounded-full bg-violet-600/10 dark:bg-violet-600/5 blur-3xl z-[-1]"></div>

      {/* Set dark background for the entire page */}
      {/* Removed background classes here as they are now handled in layout.tsx */}
      <div className="relative flex flex-col min-h-screen">
        {/* Header */}
        {/* Header: Adjusted background for better theme integration and subtle shadow */}
        {/* Header: Made transparent, removed border/shadow */}
        {/* Header: Added dark background and shadow */}
        {/* Reduced header padding */}
        {/* Made header transparent */}
        <header className="w-full py-2 fixed top-0 z-10">
          <Container>
            <div className="flex items-center justify-between">
              {/* Logo moved out of header */}
              <div className="flex items-center space-x-2">
                {/* Placeholder or remove if nothing else is on the left */}
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggleButton />
                {/* Manager Login: Adjusted text color for theme */}
                {/* Manager Login: Adjusted text color for dark theme */}
                <Link href="/api/auth/signin" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Manager Login
                </Link>
                {/* Added Admin Login Link */}
                <Link href="/api/auth/signin" className="text-sm text-gray-300 hover:text-white transition-colors">
                  Admin Login
                </Link>
              </div>
            </div>
          </Container>
        </header>

        {/* Main Content */}
        <main className="flex-grow flex items-center justify-center pt-20 px-4">
          {/* Central Card: Using Container for consistent padding and enhanced styling */}
          {/* Container for centering content */}
          <Container className="flex flex-col items-center justify-center text-center">
            {/* Logo moved here */}
            <div className="relative mb-8"> {/* Added margin-bottom */}
              <Image
                src="/owpulse_logo.PNG"
                alt="OWPulse Logo"
                width={150} // Keep original width constraint or adjust as needed
                height={100} // Doubled height prop
                priority
                className="h-28 w-auto object-contain" // Doubled Tailwind height (approx)
                style={{ width: 'auto', height: '7rem' }} // Doubled style height
              />
              {/* Optional: Keep or remove the pulse dot */}
              {/* <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div> */}
            </div>
            {/* Removed Card wrapper, direct content styling */}
            {/* Added items-center to center content within this div */}
            <div className="space-y-6 flex flex-col items-center">
              {/* Adjusted text color for better theme contrast */}
              <Heading size="h2" className="text-slate-800 dark:text-slate-100">
                How was your week?
              </Heading>
              <p className="text-slate-600 dark:text-slate-400">
                Share your vibe and let us know how things are going.
              </p>
              <Link href="/checkin">
                <Button
                  variant="default" // Use default variant and apply custom styles
                  size="lg"
                  rounded="lg"
                  // Button styling inspired by the example: purple background
                  className="w-full group bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Check In
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
                  >
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </Button>
              </Link>
            </div>
          </Container>
        </main>

        {/* Footer */}
        {/* Footer removed as requested */}
        <footer className="py-4 mt-12">
          {/* Empty footer to maintain structure if needed, but content removed */}
        </footer>
      </div>
    </>
  );
}
