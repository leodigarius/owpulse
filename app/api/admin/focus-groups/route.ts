import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth'; // Updated import path

// Helper to check for Admin role
async function isAdminRequest(request: NextRequest): Promise<boolean> {
  const session = await getServerSession(authOptions); // Use authOptions
  // Ensure session and user exist, and role is ADMIN
  // Adjust 'ADMIN' if your UserRole enum uses a different value/casing
  return !!session?.user && session.user.role === 'ADMIN'; 
}

// GET handler to fetch all focus groups
export async function GET(request: NextRequest) {
  const isAdmin = await isAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const focusGroups = await prisma.focusGroup.findMany({
      orderBy: { name: 'asc' }, // Order alphabetically
    });
    return NextResponse.json({ focusGroups }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching focus groups:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

// POST handler to create a new focus group
export async function POST(request: NextRequest) {
  const isAdmin = await isAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, description } = body; // Expect name, optionally description

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ message: 'Focus group name is required' }, { status: 400 });
    }
    if (description && typeof description !== 'string') {
         return NextResponse.json({ message: 'Invalid description format' }, { status: 400 });
    }

    // Check if group already exists (case-insensitive check might be better)
    const existingGroup = await prisma.focusGroup.findUnique({
        where: { name: name.trim() }
    });
    if (existingGroup) {
        return NextResponse.json({ message: `Focus group '${name.trim()}' already exists` }, { status: 409 }); // Conflict
    }

    // Create the new focus group
    const newFocusGroup = await prisma.focusGroup.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
      },
    });

    return NextResponse.json({ message: 'Focus group created', focusGroup: newFocusGroup }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating focus group:', error);
    // Handle potential Prisma unique constraint errors more gracefully if needed
    // if (error.code === 'P2002' && error.meta?.target?.includes('name')) { ... }
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}