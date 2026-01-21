import type { Metadata } from 'next';
import { Kanit, Sarabun } from "next/font/google";
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from "@/components/theme-provider";

const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["200", "300", "400", "500", "600"],
  variable: '--font-kanit',
});

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600"],
  variable: '--font-sarabun',
});

export const metadata: Metadata = {
  title: "PMQA 4.0 - ISOC",
  description: "Internal Security Operations Command Performance Assessment",
};

import AppFooter from '@/components/layout/AppFooter';
import AppHeader from '@/components/layout/AppHeader';
import PMQAChatbot from '@/components/chat/PMQAChatbot';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${kanit.className} ${kanit.variable} ${sarabun.variable} antialiased min-h-screen bg-slate-50 flex flex-col`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AppHeader />
            <div className="flex-1">
              {children}
            </div>
            <AppFooter />
            <PMQAChatbot />
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
