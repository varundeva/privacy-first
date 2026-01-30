import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ToolsClient } from './tools-client';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://privacyfirst.tools');

// SEO Metadata for Tools Page
export const metadata: Metadata = {
  title: 'All Free Online Tools | Image Converters, PDF Tools & More',
  description: 'Browse our complete collection of free online tools. Convert images between JPG, PNG, WebP, GIF, and more. All tools process files in your browser for maximum privacy.',
  keywords: [
    'free online tools',
    'image converter',
    'jpg to png converter',
    'png to jpg converter',
    'webp converter',
    'svg to png',
    'gif converter',
    'browser tools',
    'privacy tools',
    'no upload tools',
  ].join(', '),

  openGraph: {
    title: 'All Free Online Tools | Privacy-First Toolbox',
    description: 'Browse our complete collection of free online tools that process files entirely in your browser.',
    type: 'website',
    siteName: 'Privacy-First Toolbox',
    images: [
      {
        url: `${BASE_URL}/api/og?title=${encodeURIComponent('All Free Online Tools')}&description=${encodeURIComponent('Browse our complete collection of free browser-based tools for file conversion and manipulation.')}&category=web`,
        width: 1200,
        height: 630,
        alt: 'All Tools Collection',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'All Free Online Tools',
    description: 'Browse our complete collection of free browser-based tools.',
    images: [`${BASE_URL}/api/og?title=${encodeURIComponent('All Free Online Tools')}&description=${encodeURIComponent('Browse our complete collection of free browser-based tools for file conversion and manipulation.')}&category=web`],
  },

  alternates: {
    canonical: '/tools',
  },
};

// JSON-LD for ItemList (Collection of Tools)
function generateItemListSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Free Online Tools Collection',
    description: 'A collection of free browser-based tools for file conversion and manipulation',
    numberOfItems: 16,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Image Converters',
        description: 'Convert between JPG, PNG, WebP, GIF, BMP, SVG, and ICO formats',
      },
    ],
  };
}

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  );
}

export default function ToolsPage() {
  const itemListSchema = generateItemListSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <Suspense fallback={<Loading />}>
        <ToolsClient />
      </Suspense>
    </>
  );
}
