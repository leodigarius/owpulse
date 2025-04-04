'use client'; // Manager dashboard will likely need client-side interactivity

import React from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation'; // Use App Router's navigation

export default function ManagerDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if not authenticated or not a manager
  // This is basic client-side protection; middleware is better for robust security
  React.useEffect(() => {
    if (status === 'loading') return; // Wait until session is loaded
    if (status === 'unauthenticated' || session?.user?.role !== 'MANAGER') {
      router.push('/api/auth/signin'); // Redirect to sign-in page
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return <p className="text-center p-10">Loading dashboard...</p>;
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'MANAGER') {
    // Render minimal content or null while redirecting
    return <p className="text-center p-10">Redirecting...</p>;
  }

  // --- Manager Dashboard Content ---
  return (
    <main className="flex min-h-screen flex-col p-6 md:p-12 lg:p-24">
      <h1 className="text-3xl font-bold mb-6">Manager Dashboard</h1>
      <p className="mb-4">Welcome, {session.user?.name || session.user?.email}!</p>

      {/* Placeholder sections for dashboard features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">Wellbeing Overview</h2>
          <p className="text-gray-600">Charts and aggregated data will go here.</p>
          {/* TODO: Implement charts and data fetching */}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3">Regional Trends & Events</h2>
          <p className="text-gray-600">Detected trends and relevant news.</p>
          {/* TODO: Implement trend/event display */}
        </div>

        <div className="bg-white p-6 rounded-lg shadow col-span-1 md:col-span-2">
          <h2 className="text-xl font-semibold mb-3">Send Regional Message</h2>
          <p className="text-gray-600">AI suggestions and message sending form.</p>
          {/* TODO: Implement message generation and sending form/API call */}
        </div>
      </div>
    </main>
  );
}
