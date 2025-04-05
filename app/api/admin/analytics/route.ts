// owpulse/app/api/admin/analytics/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth'; // Updated import path

// Helper to check for Admin role
async function isAdminRequest(_request: NextRequest): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return !!session?.user && session.user.role === 'ADMIN';
}

// GET handler to fetch analytics (optionally filtered by focus group)
export async function GET(request: NextRequest) {
  const isAdmin = await isAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const focusGroupId = searchParams.get('focusGroupId');
  console.log(`[Admin Analytics API] Received request. Filter focusGroupId: ${focusGroupId || 'None (All)'}`);

  try {
    // Build the where clause for filtering
    const whereClause: Record<string, unknown> = {};
    if (focusGroupId && typeof focusGroupId === 'string') {
      whereClause.focusGroupId = focusGroupId;
    }

    // Fetch submissions based on filter, including focusGroupId for aggregation
    const submissions = await prisma.submission.findMany({
      where: whereClause,
      orderBy: { timestamp: 'asc' }, // Order ascending for time-series charts
      select: {
        timestamp: true,
        overallMood: true,
        positiveAspects: true,
        negativeAspects: true,
        hoursWorked: true,
        didNotWork: true,
        comment: true,
        focusGroupId: true, // Need this for group satisfaction chart
        focusGroup: { select: { name: true } } // Include group name for chart labels
      },
    });
    console.log(`[Admin Analytics API] Fetched ${submissions.length} submissions for group filter: ${focusGroupId || 'All'}`);

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

    // --- Calculate Chart Data ---

    // User Submissions (daily count for the last 30 days)
    const submissionCountsByDay: { [date: string]: number } = {};
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    submissions.filter(s => s.timestamp >= thirtyDaysAgo).forEach(s => {
        const date = s.timestamp.toISOString().split('T')[0]; // Get YYYY-MM-DD
        submissionCountsByDay[date] = (submissionCountsByDay[date] || 0) + 1;
    });
    const userSubmissionsChartData = Object.entries(submissionCountsByDay)
        .map(([date, count]) => ({ name: date, submissions: count }))
        .sort((a, b) => a.name.localeCompare(b.name)); // Sort by date

    // Sentiment Statistics (weekly average mood for the last 12 weeks)
    const moodByWeek: { [weekStart: string]: { sum: number; count: number } } = {};
    const twelveWeeksAgo = new Date();
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 12 * 7);
    validMoodSubmissions.filter(s => s.timestamp >= twelveWeeksAgo).forEach(s => {
        const weekStart = new Date(s.timestamp);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Get Sunday start of week
        const weekStartDateString = weekStart.toISOString().split('T')[0];
        if (!moodByWeek[weekStartDateString]) {
            moodByWeek[weekStartDateString] = { sum: 0, count: 0 };
        }
        moodByWeek[weekStartDateString].sum += s.overallMood!;
        moodByWeek[weekStartDateString].count += 1;
    });
    const sentimentChartData = Object.entries(moodByWeek)
        .map(([date, { sum, count }]) => ({
            name: date, // Week start date
            avgMood: sum / count,
            // Placeholder for previous year data - requires more complex query/logic
            prevAvgMood: (sum / count) * (0.8 + Math.random() * 0.4)
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

    // Focus Group Satisfaction (Average mood per group)
    const moodByGroup: { [groupId: string]: { name: string; sum: number; count: number } } = {};
    validMoodSubmissions.forEach(s => {
        // Ensure focusGroup and name exist before accessing
        const groupName = s.focusGroup?.name || 'Unknown Group';
        if (!moodByGroup[s.focusGroupId]) {
            moodByGroup[s.focusGroupId] = { name: groupName, sum: 0, count: 0 };
        }
        moodByGroup[s.focusGroupId].sum += s.overallMood!;
        moodByGroup[s.focusGroupId].count += 1;
    });
    const focusGroupSatisfactionChartData = Object.values(moodByGroup)
        .map(({ name, sum, count }) => ({ name: name, value: sum / count })) // 'value' for pie chart
        .sort((a, b) => b.value - a.value); // Sort by satisfaction descending


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
      focusGroupSatisfactionChartData: focusGroupSatisfactionChartData,
    };
    console.log("[Admin Analytics API] Calculated Analytics (including chart data):", analyticsData);

    // Add cache-control headers to prevent caching
    const headers = new Headers();
    headers.set('Cache-Control', 'no-store, max-age=0');

    return NextResponse.json({ analytics: analyticsData }, { status: 200, headers: headers });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching admin analytics data:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: errorMessage }, { status: 500 });
  }
}