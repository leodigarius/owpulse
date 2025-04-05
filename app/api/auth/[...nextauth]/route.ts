import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Create the NextAuth handler with the imported authOptions
const handler = NextAuth(authOptions);

// Only export the HTTP method handlers, not the authOptions object
export { handler as GET, handler as POST };
