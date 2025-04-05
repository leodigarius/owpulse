import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma'; // Use the named export
import bcrypt from 'bcrypt';

// Define UserRole enum manually based on your Prisma schema
enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  // Add other roles as defined in your schema
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: 'Credentials',
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, _req) {
        if (!credentials?.email || !credentials?.password) {
          console.error('Missing credentials');
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.passwordHash) {
          console.error('No user found or user has no password set');
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
        };
      }
    })
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
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};