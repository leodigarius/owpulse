'use client'; // Required for useState, useEffect, event handlers

import React, { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react'; // Import signOut
// Remove prisma import if not used directly (data fetched via API)
// import prisma from '@/lib/prisma';
import { FocusGroup, User, Manager } from '@prisma/client'; // Import generated types
import { TrafficChart } from '@/components/charts/TrafficChart';
import { SalesChart } from '@/components/charts/SalesChart';
import { ProfitChart } from '@/components/charts/ProfitChart';
// import { UsMapChart } from '@/components/charts/UsMapChart'; // Map component removed for now

// Combine User and Manager for easier display in manager list
type ManagerWithUser = Manager & { user: User };
// Define FocusGroup type including the optional manager relation
// Ensure the nested user type allows null if the relation isn't loaded
type FocusGroupWithManager = FocusGroup & {
    manager: (Manager & { user: User | null }) | null;
};

export default function AdminDashboardPage() {
  const [focusGroups, setFocusGroups] = useState<FocusGroupWithManager[]>([]); // Use the extended type
  const [managers, setManagers] = useState<ManagerWithUser[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [analytics, setAnalytics] = useState<any>(null); // State for analytics
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all'); // State for filter dropdown ('all' or group ID)
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isLoadingManagers, setIsLoadingManagers] = useState(true);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [error, setError] = useState<string | null>(null); // For specific action errors (add group, assign manager)
  const [fetchError, setFetchError] = useState<string | null>(null); // Separate error for initial data fetch

  // Fetch initial data (groups and managers)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingGroups(true);
      setIsLoadingManagers(true);
      setFetchError(null); // Clear previous fetch errors
      let groupFetchError = null;
      let managerFetchError = null;

      try {
        // Fetch groups
        const groupResponse = await fetch('/api/admin/focus-groups');
        if (!groupResponse.ok) {
            const errorData = await groupResponse.json().catch(() => ({ message: 'Failed to fetch focus groups' }));
            throw new Error(errorData.message || 'Failed to fetch focus groups');
        }
        const groupData = await groupResponse.json();
        // Ensure fetched data conforms to FocusGroupWithManager[]
        setFocusGroups((groupData.focusGroups || []).map((group: any) => ({
            ...group,
            manager: group.manager // Assume API returns the nested structure or null
        })) as FocusGroupWithManager[]);
      } catch (err: any) {
        groupFetchError = err.message;
        console.error("Fetch groups error:", err);
      } finally { setIsLoadingGroups(false); }

      try {
        // Fetch managers
        const managerResponse = await fetch('/api/admin/managers');
         if (!managerResponse.ok) {
            const errorData = await managerResponse.json().catch(() => ({ message: 'Failed to fetch managers' }));
            throw new Error(errorData.message || 'Failed to fetch managers');
        }
        const managerData = await managerResponse.json();
        setManagers(managerData.managers || []);
      } catch (err: any) {
        managerFetchError = err.message;
        console.error("Fetch managers error:", err);
      } finally { setIsLoadingManagers(false); }

      // Combine fetch errors if any occurred
      const combinedError = [groupFetchError, managerFetchError].filter(Boolean).join('; ');
      if (combinedError) {
          setFetchError(combinedError);
      }
    };
    fetchData();
  }, []);

  // Fetch analytics data whenever selectedGroupId changes or initial data loads
  useEffect(() => {
    // Only proceed if initial data fetching is complete
    if (isLoadingGroups || isLoadingManagers) {
        return;
    }

    // If initial fetch had errors, show error and don't fetch analytics
    if (fetchError) {
        setError(`Cannot load analytics: ${fetchError}`);
        setIsLoadingAnalytics(false);
        setAnalytics(null);
        return;
    }

    const fetchAnalytics = async () => {
      setIsLoadingAnalytics(true);
      setError(null); // Clear previous analytics errors
      const url = selectedGroupId === 'all'
        ? '/api/admin/analytics'
        : `/api/admin/analytics?focusGroupId=${selectedGroupId}`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
           const errorData = await response.json().catch(() => ({ message: 'Failed to fetch analytics' }));
           throw new Error(errorData.message || 'Failed to fetch analytics');
        }
        const data = await response.json();
        setAnalytics(data.analytics);
      } catch (err: any) {
        setError(`Analytics error: ${err.message}`); // Prefix analytics errors
        console.error("Fetch analytics error:", err);
        setAnalytics(null); // Clear analytics on error
      } finally {
        setIsLoadingAnalytics(false);
      }
    };

    fetchAnalytics();

  }, [selectedGroupId, isLoadingGroups, isLoadingManagers, fetchError]); // Dependencies

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setError(null); // Clear previous errors

    try {
      const response = await fetch('/api/admin/focus-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGroupName }),
      });
      if (!response.ok) {
         const errorData = await response.json().catch(() => ({ message: 'Failed to add focus group' }));
         throw new Error(errorData.message || 'Failed to add focus group');
      }
      const addedGroupData = await response.json();
      // Ensure the added group conforms to FocusGroupWithManager (manager will be null initially)
      const newGroup: FocusGroupWithManager = {
          ...addedGroupData.focusGroup,
          manager: null // Explicitly set manager to null for new groups
      };
      setFocusGroups(prev => [...prev, newGroup]);
      setNewGroupName(''); // Clear input
    } catch (err: any) {
       setError(`Add group error: ${err.message}`); // Prefix add group errors
       console.error("Add group error:", err);
    }
  };

  // Handler for assigning a manager to a group
  const handleAssignManager = async (groupId: string, managerUserId: string | null) => {
    setError(null); // Clear previous errors

    try {
      const response = await fetch('/api/admin/assign-manager', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, managerUserId: managerUserId === '' ? null : managerUserId }), // Send null if empty string selected
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to assign manager' }));
        throw new Error(errorData.message || 'Failed to assign manager');
      }
      // Get the updated group data from the response
      const updatedGroupData = await response.json();

      // Update the state with the data from the API response
      setFocusGroups(prev =>
        prev.map(group => group.id === groupId ? updatedGroupData.focusGroup : group)
      );

    } catch (err: any) {
      setError(`Assignment error: ${err.message}`); // Prefix assignment errors
      console.error("Assign manager error:", err);
      // No rollback needed as we didn't do an optimistic update
    }
  };

  // Helper function to render loading/error states for sections
  const renderSectionStatus = (loading: boolean, errorMsg: string | null, dataType: string) => {
    // Consolidate loading/error display logic
    if (loading) return <p className="text-sm text-muted-foreground animate-pulse">Loading {dataType}...</p>; // Use theme variable
    // Display fetchError first if it exists (covers initial load issues)
    if (fetchError && dataType === 'groups/managers') return <p className="text-sm text-destructive">Error loading initial data: {fetchError}</p>; // Use theme variable
    // Display specific action or analytics errors
    if (errorMsg && dataType !== 'groups/managers') return <p className="text-sm text-destructive">Error: {errorMsg}</p>; // Use theme variable
    return null;
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-background text-foreground"> {/* Use CSS vars */}
      {/* Heading and Logout Button */}
      <div className="flex justify-between items-center mb-6 pb-2 border-b border-border">
        <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-3 py-1.5 rounded text-sm transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Focus Group Management Card - Apply glass effect */}
          <section className="p-4 sm:p-6 custom-glass-card rounded-lg shadow-lg border border-white/10 dark:border-slate-700/30">
            <h2 className="text-xl font-semibold mb-4 text-card-foreground">Focus Group Management</h2>
            {/* Add New Group Form */}
            <form onSubmit={handleAddGroup} className="mb-6 flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-grow w-full">
                <label htmlFor="newGroupName" className="block text-sm font-medium mb-1">New Group Name:</label>
                <input
                  id="newGroupName"
                  type="text"
                  value={newGroupName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGroupName(e.target.value)} // Added type
                  className="w-full border border-input bg-background p-2 rounded text-sm focus:ring-2 focus:ring-ring focus:outline-none placeholder:text-muted-foreground"
                  placeholder="e.g., Marketing Team"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded text-sm disabled:opacity-50 transition-colors"
                disabled={!newGroupName.trim() || isLoadingGroups}
              >
                Add Group
              </button>
            </form>
            {error && error.startsWith('Add group error:') && <p className="text-sm text-destructive mb-4">{error}</p>}

            {/* Display Existing Groups */}
            <h3 className="text-lg font-medium mb-3">Existing Groups:</h3>
            {renderSectionStatus(isLoadingGroups || isLoadingManagers, fetchError, 'groups/managers')}
            {!isLoadingGroups && !isLoadingManagers && !fetchError && (
              focusGroups.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {focusGroups.map((group) => (
                    <div key={group.id} className="flex flex-wrap justify-between items-center p-3 border border-border bg-background rounded shadow-sm gap-2">
                      <span className="font-medium text-foreground flex-shrink-0 mr-2">{group.name}</span>
                      <div className="flex items-center gap-2 flex-grow justify-end">
                         <select
                           value={group.manager?.userId || ''}
                           onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleAssignManager(group.id, e.target.value || null)} // Added type
                           className="text-xs sm:text-sm border border-input bg-background p-1 rounded focus:ring-1 focus:ring-ring focus:outline-none max-w-[150px]"
                           title={`Assign manager to ${group.name}`}
                         >
                           <option value="">-- Unassigned --</option>
                           {managers.map(manager => (
                             <option key={manager.userId} value={manager.userId}>
                               {manager.user?.name || manager.user?.email || manager.userId}
                             </option>
                           ))}
                         </select>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No focus groups found.</p>
              )
            )}
            {error && error.startsWith('Assignment error:') && <p className="text-sm text-destructive mt-2">{error}</p>}
          </section>

          {/* Invite New Manager Card - Apply glass effect */}
          <section className="p-4 sm:p-6 custom-glass-card rounded-lg shadow-lg border border-white/10 dark:border-slate-700/30">
            <h2 className="text-xl font-semibold mb-4 text-card-foreground">Invite New Manager</h2>
            <form onSubmit={(e) => { e.preventDefault(); alert('Invitation logic not implemented yet.'); }} className="flex flex-col sm:flex-row gap-3 items-end">
               <div className="flex-grow w-full">
                <label htmlFor="inviteEmail" className="block text-sm font-medium mb-1">Manager Email:</label>
                <input
                  id="inviteEmail"
                  type="email"
                  className="w-full border border-input bg-background p-2 rounded text-sm focus:ring-2 focus:ring-ring focus:outline-none placeholder:text-muted-foreground"
                  placeholder="manager@example.com"
                  required
                />
              </div>
               <button
                type="submit"
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded text-sm disabled:opacity-50 transition-colors"
              >
                Send Invite
              </button>
            </form>
             <p className="text-xs mt-2 text-muted-foreground">(Email sending and sign-up flow to be implemented)</p>
          </section>

          {/* Data Upload Card - Apply glass effect */}
          <section className="p-4 sm:p-6 custom-glass-card rounded-lg shadow-lg border border-white/10 dark:border-slate-700/30">
             <h2 className="text-xl font-semibold mb-4">Upload Past Data</h2>
             <form onSubmit={(e) => {e.preventDefault(); alert('Upload logic not implemented');}}>
               <label htmlFor="dataUpload" className="block text-sm font-medium mb-1">Select File (CSV/JSON):</label>
               <input
                 type="file"
                 id="dataUpload"
                 accept=".csv, application/json"
                 className="mb-2 block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-input file:text-sm file:font-semibold file:bg-background file:text-primary hover:file:bg-accent cursor-pointer"
               />
               <button
                 type="submit"
                 className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded text-sm disabled:opacity-50 transition-colors"
               >
                 Upload Data
               </button>
             </form>
             <p className="text-xs mt-2 text-muted-foreground">(File parsing and database insertion logic to be implemented)</p>
          </section>
        </div>

        {/* Right Column (Analytics) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Analytics Section Card - Apply glass effect */}
          <section className="p-4 sm:p-6 custom-glass-card rounded-lg shadow-lg border border-white/10 dark:border-slate-700/30">
             <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                <h2 className="text-xl font-semibold">Overall Analytics</h2>
                <div className="flex items-center gap-2">
                    <label htmlFor="analyticsFilter" className="text-sm font-medium">Filter by Group:</label>
                    <select
                    id="analyticsFilter"
                    value={selectedGroupId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedGroupId(e.target.value)} // Added type
                    className="border border-input bg-background p-2 rounded text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                    disabled={isLoadingGroups || isLoadingManagers || isLoadingAnalytics || !!fetchError}
                    >
                    <option value="all">All Groups</option>
                    {!isLoadingGroups && !fetchError && focusGroups.map(group => (
                        <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                    </select>
                </div>
             </div>

             {/* Analytics Display Area */}
             <div className="min-h-[100px]">
                 {renderSectionStatus(isLoadingAnalytics, error && error.startsWith('Analytics error:') ? error : null, 'analytics')}
                 {!isLoadingAnalytics && !error && analytics && (
                    <>
                      {/* Summary Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
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
                            <p className="text-3xl font-bold text-foreground">
                              {typeof analytics.averageHours === 'number' ? analytics.averageHours.toFixed(1) : 'N/A'}
                            </p>
                         </div>
                         <div className="bg-card border border-border rounded-lg p-4 shadow-md text-center dark:shadow-glow-sm hover:shadow-lg transition-shadow duration-300">
                            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Active Groups</p>
                            <p className="text-3xl font-bold text-foreground">{focusGroups.length}</p>
                         </div>
                      </div>

                      {/* Charts Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                         {/* User Submissions Chart */}
                         <div className="bg-card border border-border rounded-lg p-4 shadow-md min-h-[300px]">
                            <h3 className="text-lg font-semibold mb-2 text-card-foreground">User Submissions (Last 30 Days)</h3>
                            <TrafficChart data={analytics.userSubmissionsChartData || []} />
                         </div>
                         {/* Sentiment Statistics Chart */}
                         <div className="bg-card border border-border rounded-lg p-4 shadow-md min-h-[300px]">
                            <h3 className="text-lg font-semibold mb-2 text-card-foreground">Sentiment Statistics (Last 12 Weeks)</h3>
                             <SalesChart data={analytics.sentimentChartData || []} />
                         </div>
                         {/* Focus Group Satisfaction Chart */}
                         <div className="bg-card border border-border rounded-lg p-4 shadow-md min-h-[300px]">
                            <h3 className="text-lg font-semibold mb-2 text-card-foreground">Focus Group Satisfaction</h3>
                              <ProfitChart data={analytics.focusGroupSatisfactionChartData || []} />
                         </div>
                         {/* Map component removed due to dependency issues */}
                         {/* <div className="bg-card border border-border rounded-lg p-4 shadow-md min-h-[300px]">
                            <h3 className="text-lg font-semibold mb-2 text-card-foreground">Top US Sales (Map Removed)</h3>
                            <div className="flex items-center justify-center h-full text-muted-foreground">Map component removed</div>
                         </div> */}
                      </div> {/* This closes the Charts Grid */}


                      {/* Top Positives/Negatives Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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

                      {/* Manager Actions Table */}
                       <div className="mt-6 bg-card border border-border rounded-lg p-4 shadow-md">
                           <h3 className="text-lg font-semibold mb-4 text-card-foreground">Manager Actions</h3>
                           <div className="overflow-x-auto">
                               <table className="w-full text-sm text-left text-card-foreground">
                                   <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                                       <tr>
                                           <th scope="col" className="px-6 py-3">Date</th>
                                           <th scope="col" className="px-6 py-3">Manager</th>
                                           <th scope="col" className="px-6 py-3">Action Type</th>
                                           <th scope="col" className="px-6 py-3">Details</th>
                                       </tr>
                                   </thead>
                                   <tbody className="divide-y divide-border">
                                       <tr className="hover:bg-muted/50">
                                           <td className="px-6 py-4 whitespace-nowrap">2025-04-03</td>
                                           <td className="px-6 py-4">Manager A</td>
                                           <td className="px-6 py-4"><span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300 border border-blue-400">Message Sent</span></td>
                                           <td className="px-6 py-4">Sent weekly summary to &apos;Operations&apos; group.</td>
                                       </tr>
                                        <tr className="hover:bg-muted/50">
                                           <td className="px-6 py-4 whitespace-nowrap">2025-04-01</td>
                                           <td className="px-6 py-4">Manager B</td>
                                           <td className="px-6 py-4"><span className="bg-purple-100 text-purple-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-purple-900 dark:text-purple-300 border border-purple-400">Event Created</span></td>
                                           <td className="px-6 py-4">Scheduled &apos;Team Lunch&apos; for &apos;Sales&apos; group.</td>
                                       </tr>
                                       {/* Add more placeholder rows as needed */}
                                   </tbody>
                               </table>
                           </div>
                       </div>
                       {/* Removed Products Overview Table */}
                    </>
                 )}
                {!isLoadingAnalytics && !error && !analytics && !fetchError && <p className="text-sm text-muted-foreground">No analytics data available for this selection.</p>}
            </div>
          </section>

          {/* Other Admin Features Card - Apply glass effect */}
          <section className="p-4 sm:p-6 custom-glass-card rounded-lg shadow-lg border border-white/10 dark:border-slate-700/30">
             <h2 className="text-xl font-semibold mb-4 text-card-foreground">Other Admin Features</h2>
             <p className="text-muted-foreground">(Manager List, etc. will go here)</p>
          </section>
        </div>
      </div>
    </div>
  );
}