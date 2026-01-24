import { Suspense } from 'react';
import type { Metadata } from 'next';
import { HomeClient } from './home-client';
import Loading from './loading';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://example.com');

// SEO Metadata for Homepage
export const metadata: Metadata = {
  title: 'Privacy-First Toolbox | Free Online Tools That Never Upload Your Files',
  description: 'Free online tools that process files entirely in your browser. Convert images, edit PDFs, and more. Your data never leaves your device. No registration required.',
  keywords: [
    'online tools',
    'image converter',
    'privacy tools',
    'browser-based tools',
    'free online converter',
    'jpg to png',
    'png to jpg',
    'webp converter',
    'no upload required',
    'offline tools',
  ].join(', '),

  openGraph: {
    title: 'Privacy-First Toolbox | Free Online Tools',
    description: 'Free online tools that process files entirely in your browser. Your data never leaves your device.',
    type: 'website',
    siteName: 'Privacy-First Toolbox',
    locale: 'en_US',
    images: [
      {
        url: `${BASE_URL}/api/og?home=true&title=${encodeURIComponent('Privacy-First Toolbox')}&description=${encodeURIComponent('Free online tools that never upload your files. 100% browser-based.')}`,
        width: 1200,
        height: 630,
        alt: 'Privacy-First Toolbox',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Privacy-First Toolbox',
    description: 'Free online tools that never upload your files. 100% browser-based.',
    images: [`${BASE_URL}/api/og?home=true&title=${encodeURIComponent('Privacy-First Toolbox')}&description=${encodeURIComponent('Free online tools that never upload your files. 100% browser-based.')}`],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  alternates: {
    canonical: '/',
  },
};

// JSON-LD Structured Data for Homepage
function generateStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Privacy-First Toolbox',
    description: 'Free online tools that process files entirely in your browser. Your data never leaves your device.',
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Privacy-First Toolbox',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`,
      },
    },
  };
}

// Organization Schema
function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Privacy-First Toolbox',
    description: 'Free online tools with privacy-first approach',
    url: BASE_URL,
  };
}

// Software Application Collection Schema
function generateSoftwareSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Privacy-First Toolbox',
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Any (Browser-based)',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Image format conversion',
      '100% browser-based processing',
      'No file uploads',
      'Works offline',
      'No registration required',
    ],
  };
}

export default function Home() {
  const websiteSchema = generateStructuredData();
  const organizationSchema = generateOrganizationSchema();
  const softwareSchema = generateSoftwareSchema();

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />

      <Suspense fallback={<Loading />}>
        <HomeClient />
      </Suspense>
    </>
  );
}
