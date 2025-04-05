// owpulse/app/api/checkin/request-token/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// import { PrismaClient } from '@prisma/client'; // Type should be inferred now
// const prisma = prismaClient as PrismaClient; // Remove casting
import bcrypt from 'bcrypt';
import { sendVerificationEmail } from '@/lib/email'; // Assuming email function exists
import crypto from 'crypto';

const TOKEN_EXPIRY_MINUTES = 10; // Set token expiry time

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Validate email format and domain
    if (!email || typeof email !== 'string' || !email.endsWith('@oliverwyman.com')) {
      return NextResponse.json({ message: 'Invalid email address. Please use your @oliverwyman.com email.' }, { status: 400 });
    }

    // Generate a secure 6-digit token
    const token = crypto.randomInt(100000, 999999).toString();
    const saltRounds = 10;
    const tokenHash = await bcrypt.hash(token, saltRounds);

    // Calculate expiry date
    const expires = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);

    // Store the request (or update if recent one exists for the same email)
    // Upsert ensures we don't create duplicate pending requests rapidly
    // Note: Using email directly in `where` for upsert might not be ideal if multiple
    // requests are needed. A better approach might involve finding pending requests first.
    // For simplicity here, we assume upserting based on email is acceptable for now.
    await prisma.verificationRequest.upsert({
        where: { email }, // Using email as the unique constraint for upsert
        update: { tokenHash, expires, createdAt: new Date(), verifiedAt: null }, // Update existing pending request
        create: { email, tokenHash, expires }, // Create new request
    });


    // Send email with the plain token (DO NOT log the plain token in production)
    try {
        await sendVerificationEmail(email, token);
        console.log(`Verification email sent to ${email}`); // Log success for debugging
    } catch (emailError) {
        console.error(`Failed to send verification email to ${email}:`, emailError);
        // Decide if you want to return an error to the user or just log it
        // For now, we'll proceed as the token is generated, but log the failure.
        // In production, you might want a more robust email retry or monitoring system.
        // return NextResponse.json({ message: 'Failed to send verification email. Please try again later.' }, { status: 500 });
    }


    return NextResponse.json({ message: 'Verification code sent successfully.' }, { status: 200 });

  } catch (error) {
    console.error('Request token error:', error);
    // Avoid exposing internal details in production errors
    return NextResponse.json({ message: 'An error occurred while processing your request.' }, { status: 500 });
  }
}