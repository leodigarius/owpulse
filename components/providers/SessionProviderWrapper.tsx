'use client'; // This directive marks the component as a Client Component

import { SessionProvider } from 'next-auth/react';
import React from 'react';

// Define the props type, expecting children
interface SessionProviderWrapperProps {
  children: React.ReactNode;
  // We could potentially pass the session object from a server component parent
  // session?: Session | null; // Uncomment if needed later
}

export default function SessionProviderWrapper({ children }: SessionProviderWrapperProps) {
  // The SessionProvider component needs to be rendered on the client
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}
