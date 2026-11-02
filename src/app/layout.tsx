import './globals.css'
import type { Metadata } from 'next'
import { Inter } from "next/font/google";
import ThemeProvider from '@/components/ThemeProvider'
import { SiteDataProvider } from '@/context/SiteDataContext'
import { siteConfig } from '@/config/content'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  ),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: [
      { url: '/assets/images/olifyhub.png', type: 'image/png' },
      { url: '/assets/images/olifyhub.png' },
    ],
    shortcut: ['/assets/images/olifyhub.png'],
    apple: [
      { url: '/assets/images/olifyhub.png', sizes: '180x180', type: 'image/png' },
      { url: '/assets/images/olifyhub.png' },
    ],
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    type: 'website',
    siteName: siteConfig.name,
    images: [
      {
        url: '/assets/images/olifyhub.png',
        width: 512,
        height: 512,
        alt: siteConfig.name,
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: siteConfig.name,
    description: siteConfig.description,
    images: ['/assets/images/olifyhub.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning style={{ backgroundColor: '#ffffff' }}>
      <head>
        <link rel="icon" href="/assets/images/olifyhub.png" type="image/png" />
        <link rel="apple-touch-icon" href="/assets/images/olifyhub.png" />
        <link rel="shortcut icon" href="/assets/images/olifyhub.png" type="image/png" />
        <style dangerouslySetInnerHTML={{ __html: `
          html, body {
            background-color: #ffffff !important;
          }
          #initial-preloader {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: #ffffff;
            z-index: 9999999;
            pointer-events: auto;
          }
        ` }} />
      </head>
      <body className={`${inter.className} min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 antialiased`}>
        <div id="initial-preloader" aria-hidden="true" />
        <ThemeProvider>
          <SiteDataProvider>
            <div className="min-h-screen flex flex-col">
              {children}
            </div>
          </SiteDataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}