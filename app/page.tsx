import { Suspense } from 'react';
import type { Metadata } from 'next';
import { HomeClient } from './home-client';
import Loading from './loading';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://privacyfirst.tools');

// SEO Metadata for Homepage
export const metadata: Metadata = {
  title: 'Free Online Converter Tools - No Upload, 100% Private | Privacy-First',
  description: 'Free online converter: images, PDF, JSON & more. No upload—100% private, browser-only processing. Edit, compress, format instantly, data stays on your device.',
  keywords: [
    'free online converter', 'image converter', 'pdf compressor online', 'json formatter', 'jpg to png', 'png to jpg',
    'webp converter', 'privacy tools', 'no upload tools', 'browser tools', 'pdf to jpg', 'word counter online'
  ].join(', '),

  openGraph: {
    title: 'Free Online Converter Tools - No Upload, 100% Private | Privacy-First',
    description: 'Free online converter: images, PDF, JSON & more. No upload—100% private, browser-only processing. Edit, compress, format instantly, data stays on your device.',
    type: 'website',
    url: BASE_URL,
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
    title: 'Free Online Converter Tools - No Upload, 100% Private | Privacy-First',
    description: 'Free online converter: images, PDF, JSON & more. No upload—100% private, browser-only processing. Edit, compress, format instantly, data stays on your device.',
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
    canonical: BASE_URL,
  },
};

// JSON-LD Structured Data for Homepage
function generateStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Free Online Converter Tools - No Upload, 100% Private | Privacy-First',
    description: 'Free online converter: images, PDF, JSON & more. No upload—100% private, browser-only processing. Edit, compress, format instantly, data stays on your device.',
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
