// owpulse/app/api/manager/analytics/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth'; // Updated import path

// Helper to check for Manager role and get their assigned focus group ID
async function getManagerFocusGroupId(request: NextRequest): Promise<string | null | undefined> {
  // Undefined = error/not manager, null = manager but unassigned, string = assigned group ID
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'MANAGER') {
    return undefined; // Not authorized or not a manager
  }

  try {
    const manager = await prisma.manager.findUnique({
      where: { userId: session.user.id },
      select: { focusGroupId: true } // Select only the focus group ID
    });
    return manager?.focusGroupId; // Returns string ID or null if unassigned
  } catch (error) {
    console.error("Error fetching manager's focus group ID:", error);
    return undefined; // Indicate an error occurred
  }
}

// GET handler to fetch analytics for the manager's focus group
export async function GET(request: NextRequest) {
  const focusGroupId = await getManagerFocusGroupId(request);

  if (focusGroupId === undefined) { // Check for error/unauthorized
    return NextResponse.json({ message: 'Unauthorized or failed to get manager data' }, { status: 403 });
  }

  if (focusGroupId === null) { // Check for unassigned manager
     return NextResponse.json({ message: 'Manager not assigned to a focus group' }, { status: 400 });
  }

  try {
    // Fetch submissions for the specific focus group, including focus group name
    const submissions = await prisma.submission.findMany({
      where: { focusGroupId: focusGroupId },
      orderBy: { timestamp: 'asc' }, // Order ascending for time-series charts
      select: {
        timestamp: true,
        overallMood: true,
        positiveAspects: true,
        negativeAspects: true,
        hoursWorked: true,
        didNotWork: true,
        comment: true,
        focusGroupId: true, // Include for consistency, though already filtered
        focusGroup: { select: { name: true } } // Get focus group name
      },
    });
    console.log(`[Manager Analytics API] Fetched ${submissions.length} submissions for group ID: ${focusGroupId}`); // Log submission count

    // --- Calculate Summary Analytics ---
    const totalSubmissions = submissions.length;
    const workedSubmissions = submissions.filter(s => !s.didNotWork);
    const validMoodSubmissions = workedSubmissions.filter(s => s.overallMood !== null);
    const validHoursSubmissions = workedSubmissions.filter(s => s.hoursWorked !== null);

    const averageMood = validMoodSubmissions.length > 0
      ? validMoodSubmissions.reduce((sum, s) => sum + (s.overallMood || 0), 0) / validMoodSubmissions.length
      : null;

    const averageHours = validHoursSubmissions.length > 0
      ? validHoursSubmissions.reduce((sum, s) => sum + (s.hoursWorked || 0), 0) / validHoursSubmissions.length
      : null;

    const positiveAspectCounts: { [key: string]: number } = {};
    const negativeAspectCounts: { [key: string]: number } = {};
    submissions.forEach(s => {
      s.positiveAspects.forEach(aspect => {
        positiveAspectCounts[aspect] = (positiveAspectCounts[aspect] || 0) + 1;
      });
      s.negativeAspects.forEach(aspect => {
        negativeAspectCounts[aspect] = (negativeAspectCounts[aspect] || 0) + 1;
      });
    });
    const sortedPositiveAspects = Object.entries(positiveAspectCounts).sort(([, a], [, b]) => b - a);
    const sortedNegativeAspects = Object.entries(negativeAspectCounts).sort(([, a], [, b]) => b - a);

    // --- Calculate Chart Data (Similar to Admin API) ---

    // User Submissions (daily count for the last 30 days)
    const submissionCountsByDay: { [date: string]: number } = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    submissions.filter(s => s.timestamp >= thirtyDaysAgo).forEach(s => {
        const date = s.timestamp.toISOString().split('T')[0];
        submissionCountsByDay[date] = (submissionCountsByDay[date] || 0) + 1;
    });
    const userSubmissionsChartData = Object.entries(submissionCountsByDay)
        .map(([date, count]) => ({ name: date, submissions: count }))
        .sort((a, b) => a.name.localeCompare(b.name));

    // Sentiment Statistics (weekly average mood for the last 12 weeks)
    const moodByWeek: { [weekStart: string]: { sum: number; count: number } } = {};
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 12 * 7);
    validMoodSubmissions.filter(s => s.timestamp >= twelveWeeksAgo).forEach(s => {
        const weekStart = new Date(s.timestamp);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekStartDateString = weekStart.toISOString().split('T')[0];
        if (!moodByWeek[weekStartDateString]) {
            moodByWeek[weekStartDateString] = { sum: 0, count: 0 };
        }
        moodByWeek[weekStartDateString].sum += s.overallMood!;
        moodByWeek[weekStartDateString].count += 1;
    });
    const sentimentChartData = Object.entries(moodByWeek)
        .map(([date, { sum, count }]) => ({
            name: date,
            avgMood: sum / count,
            prevAvgMood: (sum / count) * (0.8 + Math.random() * 0.4) // Placeholder previous year
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

    // Focus Group Satisfaction (Only relevant for the manager's single group)
    const focusGroupName = submissions[0]?.focusGroup?.name || 'Assigned Group'; // Get name from first submission
    const focusGroupSatisfactionChartData = averageMood !== null ? [{ name: focusGroupName, value: averageMood }] : [];


    const analyticsData = {
      // Summary Stats (return numbers or null)
      totalSubmissions: totalSubmissions,
      averageMood: averageMood, // Return as number or null
      averageHours: averageHours, // Return as number or null
      // Top Aspects
      topPositiveAspects: sortedPositiveAspects.slice(0, 5),
      topNegativeAspects: sortedNegativeAspects.slice(0, 5),
      // Chart Data
      userSubmissionsChartData: userSubmissionsChartData,
      sentimentChartData: sentimentChartData,
      focusGroupSatisfactionChartData: focusGroupSatisfactionChartData, // Will contain data for the manager's group
      focusGroupName: focusGroupName, // Add group name for context
    };
    console.log("[Manager Analytics API] Calculated Analytics (including chart data):", analyticsData);

    // Add cache-control headers to prevent caching
    const headers = new Headers();
    headers.set('Cache-Control', 'no-store, max-age=0');

    return NextResponse.json({ analytics: analyticsData }, { status: 200, headers: headers });

  } catch (error: any) {
    console.error('Error fetching manager analytics data:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}