// owpulse/app/api/submit/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client'; // Import Prisma namespace for types directly
import geoip from 'geoip-lite';
import { headers } from 'next/headers'; // Import headers

// Basic validation for email format (can be enhanced)
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Destructure all expected fields from the multi-step form
    const {
        overallMood,
        positiveAspects, // Expect names (string array)
        negativeAspects, // Expect names (string array)
        hoursWorked,
        comment,
        didNotWork,
        // email, // Email is no longer passed directly in submission
        anonymousUserId,
        focusGroup
    } = body;

    // --- Input Validation ---
    if (!anonymousUserId || typeof anonymousUserId !== 'string') {
      return NextResponse.json({ message: 'Invalid or missing anonymousUserId' }, { status: 400 });
    }
    // Validate didNotWork flag
    if (typeof didNotWork !== 'boolean') {
        return NextResponse.json({ message: 'Invalid or missing didNotWork flag' }, { status: 400 });
    }
    // Validate focusGroup name (always required)
    if (!focusGroup || typeof focusGroup !== 'string') {
        return NextResponse.json({ message: 'Invalid or missing focus group name' }, { status: 400 });
    }
    // Validate other fields only if the user *did* work
    if (!didNotWork) {
        if (typeof overallMood !== 'number' || overallMood < 1 || overallMood > 5) {
            return NextResponse.json({ message: 'Invalid or missing overallMood (1-5)' }, { status: 400 });
        }
        // Validate aspect names (arrays of strings)
        if (!Array.isArray(positiveAspects)) { // Allow empty array
             return NextResponse.json({ message: 'Invalid positiveAspects data' }, { status: 400 });
        }
        if (!Array.isArray(negativeAspects)) { // Allow empty array
             return NextResponse.json({ message: 'Invalid negativeAspects data' }, { status: 400 });
        }
        if (typeof hoursWorked !== 'number' || hoursWorked < 0) { // Allow 0 hours
             return NextResponse.json({ message: 'Invalid or missing hoursWorked (>= 0)' }, { status: 400 });
        }
    }
    // Validate optional comment
     if (comment && typeof comment !== 'string') {
        return NextResponse.json({ message: 'Invalid comment format' }, { status: 400 });
    }

    // --- Region Detection ---
    // --- Temporarily Disabled Region Detection ---
    let region = 'UNKNOWN'; // Default region
    console.log('Region detection temporarily disabled, defaulting to UNKNOWN.');

    // --- Database Operations ---
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Upsert Anonymous User
      const upsertedUser = await tx.anonymousUser.upsert({
        where: { id: anonymousUserId },
        create: {
          id: anonymousUserId,
          region: region, // Store region on creation
        },
        update: {
          region: region, // Update region if it changes
        },
        select: { id: true } // Select only the ID we need
      });

      // 2. Find the FocusGroup ID based on the submitted name
      const focusGroupRecord = await tx.focusGroup.findUnique({
        where: { name: focusGroup },
        select: { id: true },
      });

      if (!focusGroupRecord) {
        throw new Error(`Focus group '${focusGroup}' not found.`);
      }

      // 3. Create Submission Record with specific fields, using the found ID
      const submission = await tx.submission.create({
        data: {
          anonymousUserId: upsertedUser.id,
          region: region,
          didNotWork: didNotWork,
          // Store nulls if didNotWork is true, otherwise store the provided values
          overallMood: didNotWork ? null : overallMood,
          // Store aspect names directly as string arrays
          positiveAspects: didNotWork ? [] : positiveAspects, // Use correct variable
          negativeAspects: didNotWork ? [] : negativeAspects, // Use correct variable
          hoursWorked: didNotWork ? null : hoursWorked,
          comment: comment || null, // Store comment regardless of work status
          focusGroupId: focusGroupRecord.id, // Link to the focus group using its ID
        },
        select: { id: true } // Select only the ID
      });

       // 4. Create Action Log
       await tx.actionLog.create({
         data: {
           actionType: 'SUBMISSION',
           anonymousUserId: upsertedUser.id,
           details: {
             submissionId: submission.id,
             region: region,
             didNotWork: didNotWork,
             overallMood: didNotWork ? null : overallMood, // Log submitted data
             hoursWorked: didNotWork ? null : hoursWorked,
             hasComment: !!comment,
             // providedEmail: !!email, // Email not relevant here anymore
             focusGroup: focusGroup, // Log focus group name
             focusGroupId: focusGroupRecord.id, // Log focus group ID
           },
         },
       });

       return { userId: upsertedUser.id, submissionId: submission.id };
    });


    console.log(`Submission successful for user ${result.userId}, submission ID: ${result.submissionId}, region: ${region}`);
    return NextResponse.json({ message: 'Submission successful', submissionId: result.submissionId }, { status: 201 });

  } catch (error: any) {
    console.error('Submission API Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message || 'Unknown error' }, { status: 500 });
  }
}
