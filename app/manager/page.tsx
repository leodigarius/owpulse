// owpulse/app/manager/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react'; // Import signOut
import { useRouter } from 'next/navigation';
import { TrafficChart } from '@/components/charts/TrafficChart';
import { SalesChart } from '@/components/charts/SalesChart';
import { ProfitChart } from '@/components/charts/ProfitChart';
// import { UsMapChart } from '@/components/charts/UsMapChart'; // Removed

export default function ManagerDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignedFocusGroupName, setAssignedFocusGroupName] = useState<string | null>(null); // Use null initially

  useEffect(() => {
    if (status === 'loading') {
      return; // Wait until session status is determined
    }

    if (status === 'unauthenticated') {
      router.replace('/api/auth/signin');
      return;
    }

    if (session?.user?.role !== 'MANAGER') {
      router.replace('/'); // Redirect non-managers
      return;
    }

    // Fetch analytics data if authenticated as manager
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);
      setAssignedFocusGroupName(null); // Reset group name on fetch
      setAnalytics(null); // Reset analytics

      try {
        const response = await fetch('/api/manager/analytics');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to fetch manager analytics' }));
          // Handle specific case where manager isn't assigned
          if (response.status === 400 && errorData.message?.includes('not assigned')) {
               setAssignedFocusGroupName('None'); // Explicitly set to 'None'
               setError(null); // Not an error state, just unassigned
          } else {
               throw new Error(errorData.message || 'Failed to fetch manager analytics');
          }
        } else {
          const data = await response.json();
          setAnalytics(data.analytics);
          // Extract group name from analytics data if available (adjust based on actual API response)
          setAssignedFocusGroupName(data.analytics?.focusGroupName || 'Your Assigned Group');
        }
      } catch (err: any) {
        setError(err.message);
        console.error("Fetch manager analytics error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();

  }, [session, status, router]);

  // Loading state specific to this page
  if (status === 'loading' || (status === 'authenticated' && isLoading)) {
     return (
        <div className="min-h-screen p-8 flex items-center justify-center bg-background text-foreground">
            <p className="animate-pulse">Loading dashboard...</p>
        </div>
     );
  }

  // Error state display
  if (error) {
    return (
      <div className="min-h-screen p-8 bg-background text-foreground">
        <h1 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-500">Error Loading Dashboard</h1>
        <p className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded relative">
            {error}
        </p>
      </div>
    );
  }

  // Unassigned state display
  if (assignedFocusGroupName === 'None') {
     return (
        <div className="min-h-screen p-8 bg-background text-foreground">
             {/* Header with Logout */}
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-border">
                <h1 className="text-2xl sm:text-3xl font-bold">Manager Dashboard</h1>
                 <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-3 py-1.5 rounded text-sm transition-colors"
                    >
                    Logout
                </button>
            </div>
            <p className="mt-4 p-4 bg-muted text-muted-foreground border border-border rounded-lg">
                Welcome, {session?.user?.name || session?.user?.email}. You are not currently assigned to manage a focus group. Please contact an administrator.
            </p>
        </div>
     );
  }


  // Render the main dashboard content
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-background text-foreground">
       {/* Header with Logout */}
      <div className="flex justify-between items-center mb-6 pb-2 border-b border-border">
        <h1 className="text-2xl sm:text-3xl font-bold">
            Manager Dashboard <span className="text-lg font-normal text-muted-foreground">({assignedFocusGroupName || 'Loading group...'})</span>
        </h1>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-3 py-1.5 rounded text-sm transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Check if analytics data is available before rendering sections that depend on it */}
      {analytics ? (
        // Apply glass effect to the main content area
        <div className="space-y-6 p-4 sm:p-6 custom-glass-card rounded-lg shadow-lg border border-white/10 dark:border-slate-700/30">
            {/* Grid for key stats - Styled as Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Use bg-card for contrast against glass background */}
                <div className="bg-card border border-border rounded-lg p-4 shadow-md text-center dark:shadow-glow-sm hover:shadow-lg transition-shadow duration-300">
                    <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Total Submissions</p>
                    <p className="text-3xl font-bold text-foreground">{analytics.totalSubmissions ?? 'N/A'}</p>
                </div>
                <div className="bg-card border border-border rounded-lg p-4 shadow-md text-center dark:shadow-glow-sm hover:shadow-lg transition-shadow duration-300">
                    <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Avg. Mood</p>
                     <div className="flex items-center justify-center gap-2">
                        <span className="text-3xl">
                            {/* Map mood score to emoji */}
                            {analytics.averageMood === null ? '❓' :
                             analytics.averageMood < 1.5 ? '😫' :
                             analytics.averageMood < 2.5 ? '😔' :
                             analytics.averageMood < 3.5 ? '😐' :
                             analytics.averageMood < 4.5 ? '😊' : '🤩'}
                        </span>
                        <p className="text-3xl font-bold text-foreground">
                            {typeof analytics.averageMood === 'number' ? analytics.averageMood.toFixed(1) : 'N/A'}
                        </p>
                    </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-4 shadow-md text-center dark:shadow-glow-sm hover:shadow-lg transition-shadow duration-300">
                    <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Avg. Hours Worked</p>
                    <p className="text-3xl font-bold text-foreground">{analytics.averageHours?.toFixed(1) ?? 'N/A'}</p>
                </div>
                 <div className="bg-card border border-border rounded-lg p-4 shadow-md text-center dark:shadow-glow-sm hover:shadow-lg transition-shadow duration-300">
                    <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Group Members</p>
                    <p className="text-3xl font-bold text-foreground">N/A</p> {/* Placeholder */}
                 </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Use bg-card for contrast */}
                <div className="bg-card border border-border rounded-lg p-4 shadow-md min-h-[300px]">
                    {/* Updated Title */}
                    <h3 className="text-lg font-semibold mb-2 text-card-foreground">Sentiment Statistics (Last 12 Weeks)</h3>
                    {/* Pass dynamic data */}
                    <SalesChart data={analytics.sentimentChartData || []} />
                </div>
                <div className="bg-card border border-border rounded-lg p-4 shadow-md min-h-[300px]">
                     {/* Updated Title */}
                    <h3 className="text-lg font-semibold mb-2 text-card-foreground">User Submissions (Last 30 Days)</h3>
                     {/* Pass dynamic data */}
                    <TrafficChart data={analytics.userSubmissionsChartData || []} />
                </div>
                 <div className="bg-card border border-border rounded-lg p-4 shadow-md min-h-[300px]">
                     {/* Updated Title */}
                    <h3 className="text-lg font-semibold mb-2 text-card-foreground">Focus Group Satisfaction</h3>
                    {/* Pass dynamic data */}
                    {/* Manager view only shows their group, so pie chart might be less useful than just the summary card */}
                    <ProfitChart data={analytics.focusGroupSatisfactionChartData || []} />
                    {/* <div className="flex items-center justify-center h-full text-muted-foreground">
                        (Satisfaction shown in summary card & above chart)
                    </div> */}
                </div>
                {/* Removed Map Section */}
            </div>

            {/* Top Positives and Negatives */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Use bg-card for contrast */}
                <div className="bg-card border border-border rounded-lg p-4 shadow-md">
                <h3 className="text-lg font-semibold mb-2 text-foreground">Top Positives</h3>
                {analytics.topPositiveAspects?.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1 text-sm text-foreground">
                    {analytics.topPositiveAspects.map(([aspect, count]: [string, number]) => (
                        <li key={aspect}>{aspect} ({count})</li>
                    ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground">No positive aspects reported.</p>
                )}
                </div>
                <div className="bg-card border border-border rounded-lg p-4 shadow-md">
                <h3 className="text-lg font-semibold mb-2 text-foreground">Top Challenges</h3>
                {analytics.topNegativeAspects?.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1 text-sm text-foreground">
                    {analytics.topNegativeAspects.map(([aspect, count]: [string, number]) => (
                        <li key={aspect}>{aspect} ({count})</li>
                    ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground">No challenges reported.</p>
                )}
                </div>
            </div>

            {/* Recent Submissions Table */}
            <div className="bg-card border border-border rounded-lg p-4 shadow-md">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Recent Submissions</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-foreground">
                        <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                            <tr>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">User (Optional)</th>
                                <th scope="col" className="px-6 py-3">Mood</th>
                                <th scope="col" className="px-6 py-3">Hours</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            <tr className="hover:bg-muted/50">
                                <td className="px-6 py-4 whitespace-nowrap">2025-04-03</td>
                                <td className="px-6 py-4">User A</td>
                                <td className="px-6 py-4">4</td>
                                <td className="px-6 py-4">8.5</td>
                            </tr>
                             <tr className="hover:bg-muted/50">
                                <td className="px-6 py-4 whitespace-nowrap">2025-04-02</td>
                                <td className="px-6 py-4">User B</td>
                                <td className="px-6 py-4">3</td>
                                <td className="px-6 py-4">7.0</td>
                            </tr>
                            {/* More rows */}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      ) : (
         // Render simplified view or specific message if analytics is null but not loading/error/unassigned
         !isLoading && !error && assignedFocusGroupName !== 'None' && (
             <p className="mt-4 p-4 bg-muted text-muted-foreground border border-border rounded-lg">
                 Analytics data is currently unavailable for your assigned group: {assignedFocusGroupName}.
             </p>
         )
      )}
    </div>
  );
}