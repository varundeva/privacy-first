import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Header } from '@/components/layout'
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://example.com')),
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/android-icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon-57x57.png', sizes: '57x57' },
      { url: '/apple-icon-60x60.png', sizes: '60x60' },
      { url: '/apple-icon-72x72.png', sizes: '72x72' },
      { url: '/apple-icon-76x76.png', sizes: '76x76' },
      { url: '/apple-icon-114x114.png', sizes: '114x114' },
      { url: '/apple-icon-120x120.png', sizes: '120x120' },
      { url: '/apple-icon-144x144.png', sizes: '144x144' },
      { url: '/apple-icon-152x152.png', sizes: '152x152' },
      { url: '/apple-icon-180x180.png', sizes: '180x180' },
    ],
    other: [
      { rel: 'manifest', url: '/manifest.json' },
    ],
  },
  other: {
    'msapplication-TileColor': '#ffffff',
    'msapplication-TileImage': '/ms-icon-144x144.png',
  },
  themeColor: '#ffffff',
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
      </body>
    </html>
  )
}
