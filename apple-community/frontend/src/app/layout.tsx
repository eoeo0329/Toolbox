import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { TabBar } from '@/components/ui/Navigation';

export const metadata: Metadata = {
  title: 'Apple Community',
  description: '高级 iOS 风格社区 App',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#F2F2F7" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="antialiased min-h-screen bg-background-light dark:bg-background-dark">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <AppProvider>
            <main className="mx-auto max-w-2xl w-full relative min-h-screen">
              {children}
              <TabBar floating />
            </main>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
