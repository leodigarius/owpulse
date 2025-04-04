import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
// Adjust the import path based on your actual file structure for authOptions
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; 

// Helper to check for Admin role (copied from focus-groups route)
async function isAdminRequest(request: NextRequest): Promise<boolean> {
  const session = await getServerSession(authOptions); 
  return !!session?.user && session.user.role === 'ADMIN'; 
}

// GET handler to fetch all managers with their user details
export async function GET(request: NextRequest) {
  const isAdmin = await isAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const managers = await prisma.manager.findMany({
      include: {
        user: { // Include related User data
          select: { 
            id: true, 
            name: true, 
            email: true,
            // Add other User fields if needed
          } 
        },
        // Optionally include focus group info if needed directly here
        // focusGroup: { select: { id: true, name: true } } 
      },
      orderBy: { user: { name: 'asc' } }, // Order by user name
    });
    return NextResponse.json({ managers }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching managers:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

// Note: POST/PUT/DELETE for managers might involve creating/updating 
// both User and Manager records, potentially via invitations later.