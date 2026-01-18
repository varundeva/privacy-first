import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { Header} from '@/components/layout'
import { Footer } from '@/components/layout'
import './globals.css'

const geist = Geist({ 
  subsets: ["latin"],
  variable: '--font-geist-sans',
});

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'Privacy-First Toolbox | Free Online Tools',
    template: '%s | Privacy-First Toolbox',
  },
  description: 'Free, privacy-first tools that run entirely in your browser. Convert images, manipulate PDFs, and more. Your data never leaves your device.',
  keywords: ['privacy', 'tools', 'converter', 'image', 'pdf', 'text', 'online tools', 'browser-based', 'no upload'],
  authors: [{ name: 'Privacy-First Toolbox' }],
  creator: 'Privacy-First Toolbox',
  metadataBase: new URL('https://example.com'), // Update with actual domain
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'Privacy-First Toolbox | Free Online Tools',
    description: 'Free, privacy-first tools that run entirely in your browser. Your data never leaves your device.',
    type: 'website',
    siteName: 'Privacy-First Toolbox',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy-First Toolbox',
    description: 'Free online tools that never upload your files. 100% browser-based.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
