import { Suspense } from 'react';
import type { Metadata } from 'next';
import { toolsConfig } from '@/lib/tools-config';
import { ToolsClient } from './tools-client';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://privacyfirst.tools';

// SEO Metadata for Tools Page
export const metadata: Metadata = {
  title: 'All Free Online Tools | 75+ Private Image, PDF, Code & Text Utilities',
  description: 'Browse our complete catalog of 75+ free browser-based online tools. Convert and process images, PDFs, text, JSON, and cryptographic hashes 100% locally in your browser.',
  keywords: [
    'free online tools',
    'image converter',
    'pdf tools',
    'json formatter',
    'crypto hashes',
    'browser tools',
    'privacy tools',
    'no upload tools',
    'client side tools',
  ].join(', '),

  openGraph: {
    title: 'All Free Online Tools | Privacy-First Toolbox',
    description: 'Browse our complete catalog of 75+ free browser-based tools that process files entirely in your browser.',
    type: 'website',
    siteName: 'Privacy-First Toolbox',
    images: [
      {
        url: `${BASE_URL}/api/og?title=${encodeURIComponent('All 75+ Free Online Tools')}&description=${encodeURIComponent('Browse our complete collection of free browser-based tools with zero server uploads.')}&category=web`,
        width: 1200,
        height: 630,
        alt: 'All Tools Collection',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'All Free Online Tools | Privacy-First Toolbox',
    description: 'Browse our complete catalog of 75+ free browser-based tools.',
    images: [`${BASE_URL}/api/og?title=${encodeURIComponent('All 75+ Free Online Tools')}&description=${encodeURIComponent('Browse our complete collection of free browser-based tools with zero server uploads.')}&category=web`],
  },

  alternates: {
    canonical: '/tools',
  },
};

// JSON-LD for ItemList (Collection of All Tools)
function generateItemListSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Free Privacy-First Online Tools Collection',
    description: 'A comprehensive collection of free browser-based tools for image, PDF, text, and data manipulation',
    numberOfItems: toolsConfig.length,
    itemListElement: toolsConfig.map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: tool.name,
      description: tool.description,
      url: `${BASE_URL}/tools/${tool.category}/${tool.slug}`,
    })),
  };
}

// JSON-LD for BreadcrumbList
function generateBreadcrumbSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'All Tools',
        item: `${BASE_URL}/tools`,
      },
    ],
  };
}

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

export default function ToolsPage() {
  const itemListSchema = generateItemListSchema();
  const breadcrumbSchema = generateBreadcrumbSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Suspense fallback={<Loading />}>
        <ToolsClient />
      </Suspense>
    </>
  );
}
