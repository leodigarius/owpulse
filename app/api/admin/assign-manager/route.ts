import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Adjust path

// Helper to check for Admin role
async function isAdminRequest(request: NextRequest): Promise<boolean> {
  const session = await getServerSession(authOptions); 
  return !!session?.user && session.user.role === 'ADMIN'; 
}

// POST handler to assign/unassign a manager to a focus group
export async function POST(request: NextRequest) {
  const isAdmin = await isAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { groupId, managerUserId } = body; // managerUserId can be null to unassign

    if (!groupId || typeof groupId !== 'string') {
      return NextResponse.json({ message: 'Invalid or missing groupId' }, { status: 400 });
    }
    // Allow managerUserId to be null (for unassigning) or a string
    if (managerUserId !== null && typeof managerUserId !== 'string') {
         return NextResponse.json({ message: 'Invalid managerUserId format' }, { status: 400 });
    }

    // Use a transaction to ensure consistency, especially if unassigning previous manager
    const updatedFocusGroup = await prisma.$transaction(async (tx) => {
        // 1. Find the target focus group
        const group = await tx.focusGroup.findUnique({ where: { id: groupId } });
        if (!group) {
            throw new Error(`Focus group with ID ${groupId} not found.`);
        }

        // 2. Find the target manager profile ID based on the user ID (if assigning)
        let managerProfileId: string | null = null;
        if (managerUserId) {
            const manager = await tx.manager.findUnique({ 
                where: { userId: managerUserId },
                select: { id: true } 
            });
            if (!manager) {
                // This could happen if a User exists but doesn't have a Manager profile yet
                // Handle this case - maybe create Manager profile or return error?
                // For now, let's throw an error. Consider creating Manager profile on demand later.
                 throw new Error(`Manager profile not found for user ID ${managerUserId}. Cannot assign.`);
            }
            managerProfileId = manager.id;
        }
        
        // 3. Update the FocusGroup's manager relation
        // This automatically handles unsetting the previous manager if one existed
        // due to the one-to-one nature defined in the schema (managerId is unique on FocusGroup)
        // If changing to many-to-many later, this logic would need adjustment.
        const updatedGroup = await tx.focusGroup.update({
            where: { id: groupId },
            data: {
                manager: managerProfileId 
                    ? { connect: { id: managerProfileId } } // Connect new manager
                    : { disconnect: true } // Disconnect if managerUserId is null
            },
            include: { // Include the updated manager details in the response
                manager: {
                    include: {
                        user: { select: { id: true, name: true, email: true } }
                    }
                }
            }
        });
        return updatedGroup;
    });


    return NextResponse.json({ 
        message: `Manager assignment updated for group ${updatedFocusGroup.name}`, 
        focusGroup: updatedFocusGroup // Send back the updated group with manager info
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error assigning manager:', error);
    // Handle specific errors like manager not found if needed
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}