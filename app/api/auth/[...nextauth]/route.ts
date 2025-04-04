import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/prisma'; // Use the singleton instance
import bcrypt from 'bcrypt';
// Define UserRole enum manually based on your Prisma schema
enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  // Add other roles as defined in your schema
}

// Don't export this directly, only use it within this file
// Export authOptions so it can be used by getServerSession elsewhere
export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: 'Credentials',
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          console.error('Missing credentials');
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.passwordHash) {
          console.error('No user found or user has no password set');
          // Optionally: Log attempt with credentials.email for monitoring
          return null;
        }

        // Validate password
        const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isValidPassword) {
          console.error('Invalid password for user:', credentials.email);
          return null;
        }

        console.log('User authorized:', user.email, 'Role:', user.role);
        // Return user object that will be encoded in the JWT
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role, // Include the role
          // Add other user properties you want in the session/token
        };
      }
    })
    // ...add more providers here if needed (e.g., Google, GitHub)
  ],
  session: {
    strategy: 'jwt', // Use JWT for session strategy as recommended
  },
  callbacks: {
    // Include user role in the JWT token
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id; // Add user id to token
      }
      return token;
    },
    // Include user role and id in the session object
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as UserRole; // Cast role from token
        session.user.id = token.id as string; // Add user id to session
      }
      return session;
    }
  },
  // Remove custom pages configuration since they don't exist yet
  // pages: {
  //   signIn: '/auth/signin',
  //   error: '/auth/error',
  //   signOut: '/auth/signout',
  // },
  // Secret for signing tokens - MUST be set in environment variables
  secret: process.env.NEXTAUTH_SECRET,
  // Debugging logs in development
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
