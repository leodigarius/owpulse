import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth'; // Updated import path
import crypto from 'crypto'; // For generating a secure token
import { sendManagerInviteEmail } from '@/lib/email'; // Import email function
// TODO: Import email sending function (e.g., from '@/lib/email')

// Helper to check for Admin role
async function isAdminRequest(request: NextRequest): Promise<boolean> {
  const session = await getServerSession(authOptions); 
  return !!session?.user && session.user.role === 'ADMIN'; 
}

// Basic email validation
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// POST handler to create an invitation and (eventually) send email
export async function POST(request: NextRequest) {
  const isAdmin = await isAdminRequest(request);
  if (!isAdmin) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { email } = body; 

    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      return NextResponse.json({ message: 'Valid email address is required' }, { status: 400 });
    }

    // Check if user with this email already exists (as User or Manager)
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: 'A user with this email already exists.' }, { status: 409 }); // Conflict
    }
    
    // Check if an invitation already exists for this email (optional: resend?)
    const existingInvite = await prisma.managerInvitation.findUnique({ where: { email } });
    if (existingInvite) {
        // Decide policy: error out, or resend/update token? For now, error.
         return NextResponse.json({ message: 'An invitation already exists for this email.' }, { status: 409 });
    }

    // Generate a secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // Token expires in 24 hours

    // Create the invitation record
    const invitation = await prisma.managerInvitation.create({
      data: {
        email: email,
        token: token,
        expires: expires,
      },
    });

    // --- Send Invitation Email ---
    const inviteLink = `${process.env.NEXTAUTH_URL}/auth/manager-signup?token=${token}`;
    const emailSent = await sendManagerInviteEmail(email, inviteLink);

    if (!emailSent) {
        // Optional: Decide if you want to delete the invitation record if email fails
        // await prisma.managerInvitation.delete({ where: { id: invitation.id } });
        // Return an error indicating email failure
        console.warn(`Failed to send invitation email to ${email}. Invitation record created but email not sent.`);
        // Return success for record creation, but maybe with a warning? Or return an error?
        // For now, let's still return success for the API call, but log the warning.
    }
    // Example: await sendEmail({ to: email, subject: 'Manager Invitation', html: `<p>Click <a href="${inviteLink}">here</a> to sign up.</p>` });

    return NextResponse.json({
        message: `Invitation created for ${email}.${emailSent ? ' Email sent.' : ' Email failed to send.'}`,
        invitationId: invitation.id
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating manager invitation:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}