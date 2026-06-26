import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { I18nProvider } from '@/i18n/context';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'InsightFlow - Analytics Dashboard',
  description: 'Real-time analytics platform for modern businesses. Track events, build dashboards, and gain insights with AI-powered analytics.',
  keywords: ['analytics', 'dashboard', 'events', 'tracking', 'SaaS'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrains.variable} font-sans`}>
        <I18nProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                classNames: {
                  toast: 'bg-card border-border text-foreground',
                  title: 'text-foreground font-medium',
                  description: 'text-muted-foreground',
                },
              }}
            />
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
