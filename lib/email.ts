import { Resend } from 'resend';

// Ensure API key and From address are set in environment variables
const RESEND_API_KEY = process.env.re_5Juu8wjz_DBgqFFbNmk6CbzMKSZy3kaSn; 
const EMAIL_FROM = process.env.EMAIL_FROM_ADDRESS;

if (!RESEND_API_KEY) {
  console.error('Missing RESEND_API_KEY environment variable');
}

if (!EMAIL_FROM) {
  console.error('Missing EMAIL_FROM_ADDRESS environment variable');
}

const resend = new Resend(RESEND_API_KEY);

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  const { to, subject, html } = options;
  
  try {
    const data = await resend.emails.send({
      from: EMAIL_FROM || 'onboarding@resend.dev',
      to,
      subject,
      html,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
}
