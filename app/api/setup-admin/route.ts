import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

// Define the admin credentials
const ADMIN_EMAIL = 'OWPulsar@admin.local'; // Using email format as required by CredentialsProvider
const ADMIN_PASSWORD = '!LightBendsAroundMe123';
const ADMIN_NAME = 'OWPulsar Admin'; // Optional name

export async function GET() {
  try {
    // Check if the admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
    });

    if (existingAdmin) {
      console.log(`Admin user ${ADMIN_EMAIL} already exists.`);
      return NextResponse.json({ message: `Admin user ${ADMIN_EMAIL} already exists.` }, { status: 200 });
    }

    // Hash the password
    const saltRounds = 10; // Standard salt rounds for bcrypt
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, saltRounds);

    // Create the admin user
    const adminUser = await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        passwordHash: hashedPassword,
        role: 'ADMIN', // Ensure this matches your UserRole enum value in schema
        // emailVerified: new Date(), // Optional: Mark email as verified if needed
      },
    });

    console.log(`Admin user ${adminUser.email} created successfully with ID: ${adminUser.id}`);
    return NextResponse.json({ message: `Admin user ${adminUser.email} created successfully.` }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating admin user:', error);
    return NextResponse.json({ message: 'Internal Server Error creating admin user', error: error.message }, { status: 500 });
  }
}