import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SessionProviderWrapper from "@/components/providers/SessionProviderWrapper";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Update metadata for OW Pulse
export const metadata: Metadata = {
  title: "OW Pulse | Employee Wellbeing Platform",
  description: "Collect employee feedback and improve workplace wellbeing",
  keywords: ["employee wellbeing", "workplace wellness", "mood tracking", "employee feedback"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/owpulse_logo.PNG" />
        <link rel="icon" type="image/png" sizes="32x32" href="/owpulse_logo.PNG" />
        <link rel="icon" type="image/png" sizes="16x16" href="/owpulse_logo.PNG" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
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
