// owpulse/app/api/checkin/verify-token/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { email, token } = await request.json();

    if (!email || typeof email !== 'string' || !token || typeof token !== 'string') {
      return NextResponse.json({ message: 'Email and token are required.' }, { status: 400 });
    }

    // 1. Find the most recent *unverified* verification request for the email
    // Order by createdAt descending to get the latest one if multiple exist
    const verificationRequest = await prisma.verificationRequest.findFirst({
      where: {
        email: email,
        verifiedAt: null, // Only find unverified requests
        expires: {
          gt: new Date(), // Only find non-expired requests
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!verificationRequest) {
      // No active, unverified request found
      return NextResponse.json({ message: 'Invalid or expired verification code.' }, { status: 400 });
    }

    // 2. Compare the provided token with the stored hash
    const isTokenValid = await bcrypt.compare(token, verificationRequest.tokenHash);

    if (!isTokenValid) {
      // Optional: Implement rate limiting or attempt tracking here
      return NextResponse.json({ message: 'Invalid verification code.' }, { status: 400 });
    }

    // 3. Mark the request as verified (do this *before* returning user ID)
    // Use updateMany in case multiple requests were somehow created, mark all valid ones for this email/token as verified
    // Although the findFirst logic should prevent needing this, it adds robustness.
    await prisma.verificationRequest.updateMany({
        where: {
            id: verificationRequest.id, // Target the specific request we validated
            // email: email,
            // tokenHash: verificationRequest.tokenHash, // Ensure we only update the one matching the hash
            verifiedAt: null // Ensure we only update if not already verified (prevent race conditions)
        },
        data: { verifiedAt: new Date() },
    });


    // 4. Find or create the AnonymousUser associated with this email
    // Use email as the unique identifier for AnonymousUser
    const anonymousUser = await prisma.anonymousUser.upsert({
      where: { email: email },
      update: {}, // No update needed if user exists
      create: { email: email }, // Create user if they don't exist
    });

    // 5. Return success and the anonymousUserId
    return NextResponse.json({ success: true, anonymousUserId: anonymousUser.id }, { status: 200 });

  } catch (error) {
    console.error('Verify token error:', error);
    return NextResponse.json({ message: 'An error occurred during verification.' }, { status: 500 });
  }
}