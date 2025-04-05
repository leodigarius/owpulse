import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // Updated import path
import prisma from '@/lib/prisma';
import { sendRegionalMessageEmails } from '@/lib/email'; // Import the email function
// import { UserRole } from '@prisma/client'; // Removed problematic import

// Define a type alias for the transaction client
type PrismaTransactionClient = typeof prisma;

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  // 1. Authentication and Authorization Check
  // Use string comparison instead of enum to avoid import issues
  if (!session || !session.user || session.user.role !== 'MANAGER') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const managerUserId = session.user.id; // Get manager's user ID from session

  try {
    const body = await request.json();
    const { message, region } = body;

    // 2. Input Validation
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json({ message: 'Message content cannot be empty' }, { status: 400 });
    }
    if (!region || typeof region !== 'string' || region.trim() === '') {
      return NextResponse.json({ message: 'Region cannot be empty' }, { status: 400 });
    }
    // TODO: Potentially validate region against a predefined list

    // 3. Database Operations (Transaction)
    const result = await prisma.$transaction(async (tx) => {
      // Find the Manager profile linked to the User ID
      const managerProfile = await tx.manager.findUnique({
        where: { userId: managerUserId },
        select: { id: true } // Select only the manager profile ID
      });

      if (!managerProfile) {
        // This case should ideally not happen if the role check passed, but good to handle
        throw new Error('Manager profile not found for the authenticated user.');
      }

      // Create the Regional Message
      const createdMessage = await tx.regionalMessage.create({
        data: {
          message: message,
          region: region,
          createdBy: managerProfile.id, // Link to the manager profile ID
          // periodStart, periodEnd could be added if needed
        },
        select: { id: true } // Select the ID of the created message
      });

      // Create Action Log for message creation
      await tx.actionLog.create({
        data: {
          actionType: 'MESSAGE_SENT', // Or 'MESSAGE_CREATED' / 'MESSAGE_APPROVED'
          managerId: managerProfile.id, // Link to manager profile ID
          details: {
            messageId: createdMessage.id,
            region: region,
            messageLength: message.length,
          },
        },
      });

      return { messageId: createdMessage.id, managerProfileId: managerProfile.id };
    });

    // 4. Trigger Email Sending Asynchronously (Fire and Forget)
    // We don't await this, so the API responds quickly to the manager.
    // Error handling within sendRegionalMessageEmails will log issues.
    sendRegionalMessageEmails(result.messageId, region)
      .then(({ successCount, errorCount }) => {
        console.log(`Async email sending initiated for message ${result.messageId}, region ${region}. Potential results - Success: ${successCount}, Errors: ${errorCount}`);
      })
      .catch(emailError => {
        // This catch is for errors *initiating* the async call, not errors *during* email sending
        console.error(`Error initiating async email sending for message ${result.messageId}:`, emailError);
        // Consider additional logging or alerting here if initiation fails critically
      });

    console.log(`Manager ${result.managerProfileId} created message ${result.messageId} for region ${region}. Email sending initiated.`);
    return NextResponse.json({ message: 'Regional message created successfully. Email sending initiated.', messageId: result.messageId }, { status: 201 });

  } catch (error: any) {
    console.error('Send Message API Error:', error);
    // Handle specific errors like manager profile not found from the transaction
    if (error.message.includes('Manager profile not found')) {
       return NextResponse.json({ message: 'Internal Server Error: Manager profile mismatch.' }, { status: 500 });
    }
    return NextResponse.json({ message: 'Internal Server Error', error: error.message || 'Unknown error' }, { status: 500 });
  }
}
