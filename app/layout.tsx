import './globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import SessionProviderWrapper from '@/components/providers/SessionProviderWrapper';

export const metadata = {
  title: 'OWPulse',
  description: 'Share your feedback with OWPulse',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProviderWrapper>
            {children}
          </SessionProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
