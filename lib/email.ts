import { Resend } from 'resend';

// Ensure API key and From address are set in environment variables
const RESEND_API_KEY = process.env.EMAIL_API_KEY; 
const EMAIL_FROM = process.env.EMAIL_FROM_ADDRESS;

if (!RESEND_API_KEY) {
  console.warn("EMAIL_API_KEY environment variable is not set. Email sending will be disabled.");
}
if (!EMAIL_FROM) {
    console.warn("EMAIL_FROM_ADDRESS environment variable is not set. Using default sender.");
}

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

interface EmailOptions {
  to: string;
  subject: string;
  html: string; // Use HTML for formatted emails
  // Add cc, bcc, attachments etc. if needed later
}

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  if (!resend) {
    console.error("Resend client not initialized. Cannot send email.");
    // In development, maybe log the email content instead of failing silently
    console.log(`--- Email Disabled ---
To: ${to}
Subject: ${subject}
Body (HTML):
${html}
----------------------`);
    return false; // Indicate email was not sent
  }
  
  const fromAddress = EMAIL_FROM || 'yourweek@owpulse.com'; // Use desired address as fallback, but ENV var is preferred

  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: to,
      subject: subject,
      html: html,
    });

    if (error) {
      console.error(`Error sending email via Resend to ${to}:`, error);
      return false;
    }

    console.log(`Email sent successfully to ${to}. ID: ${data?.id}`);
    return true;
  } catch (error) {
    console.error(`Exception sending email to ${to}:`, error);
    return false;
  }
}

// Specific function for sending manager invites
export async function sendManagerInviteEmail(email: string, inviteLink: string): Promise<boolean> {
    const subject = "You're Invited to Manage on OWPulse!";
    // Basic HTML email template - enhance as needed
    const html = `
        <h1>OWPulse Manager Invitation</h1>
        <p>You have been invited to become a manager on the OWPulse platform.</p>
        <p>Click the link below to create your account. This link will expire in 24 hours.</p>
        <p><a href="${inviteLink}" target="_blank" style="padding: 10px 15px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">Create Your Manager Account</a></p>
        <p>If you did not expect this invitation, please ignore this email.</p>
        <br>
        <p>Best regards,</p>
        <p>The OWPulse Team</p>
    `;

    return sendEmail({ to: email, subject, html });
}

// Specific function for sending check-in verification codes
export async function sendVerificationEmail(email: string, token: string): Promise<boolean> {
    const subject = "Your OWPulse Check-in Verification Code";
    // Basic HTML email template
    const html = `
        <h1>OWPulse Check-in Verification</h1>
        <p>Enter the following code on the check-in page to verify your email address.</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 20px 0; padding: 10px; background-color: #f0f0f0; border-radius: 5px; text-align: center; color: #333;">
            ${token}
        </p>
        <p>This code will expire in ${process.env.TOKEN_EXPIRY_MINUTES || 10} minutes.</p>
        <p>If you did not request this code, please ignore this email.</p>
        <br>
        <p>Best regards,</p>
        <p>The OWPulse Team</p>
    `;

    return sendEmail({ to: email, subject, html });
}

// Function for sending regional messages to employees
export async function sendRegionalMessageEmails(messageId: string, region: string): Promise<{successCount: number, errorCount: number}> {
    // Get message from database
    const prisma = await import('./prisma').then(mod => mod.default);
    
    try {
        // Get the message content
        const message = await prisma.regionalMessage.findUnique({
            where: { id: messageId },
            select: { message: true }
        });
        
        if (!message) {
            console.error(`Message with ID ${messageId} not found`);
            return { successCount: 0, errorCount: 0 };
        }
        
        // Get all anonymous users in the region with emails
        const users = await prisma.anonymousUser.findMany({
            where: { 
                region: region, 
                email: { not: null } 
            },
            select: { email: true }
        });
        
        if (!users || users.length === 0) {
            console.log(`No users found in region ${region} with valid emails`);
            return { successCount: 0, errorCount: 0 };
        }
        
        console.log(`Sending message to ${users.length} users in region ${region}`);
        
        let successCount = 0;
        let errorCount = 0;
        
        // Send email to each user
        for (const user of users) {
            if (!user.email) continue;
            
            const subject = "Message from Your Manager";
            const html = `
                <h1>Message from Your Manager</h1>
                <p>Hello,</p>
                <div style="padding: 15px; background-color: #f9f9f9; border-left: 4px solid #4f46e5; margin: 15px 0;">
                    ${message.message}
                </div>
                <p>This message was sent to all team members in your region.</p>
                <br>
                <p>Best regards,</p>
                <p>Your OWPulse Management Team</p>
            `;
            
            const success = await sendEmail({ to: user.email, subject, html });
            if (success) {
                successCount++;
            } else {
                errorCount++;
            }
        }
        
        return { successCount, errorCount };
    } catch (error) {
        console.error('Error sending regional message emails:', error);
        return { successCount: 0, errorCount: 1 };
    }
}
