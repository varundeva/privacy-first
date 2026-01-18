import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getToolBySlug, toolsConfig } from '@/lib/tools-config';
import { ToolPageClient } from './client';

interface PageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

// Generate static params for all tools (better performance)
export async function generateStaticParams() {
  return toolsConfig.map((tool) => ({
    category: tool.category,
    slug: tool.slug,
  }));
}

// Generate SEO-optimized metadata for each tool
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const tool = getToolBySlug(params.slug);

  if (!tool) {
    return {
      title: 'Tool Not Found',
      description: 'The requested tool does not exist.',
    };
  }

  const { seo } = tool;

  return {
    title: seo.title,
    description: seo.metaDescription,
    keywords: tool.keywords.join(', '),
    
    // Open Graph
    openGraph: {
      title: seo.title,
      description: seo.metaDescription,
      type: 'website',
      siteName: 'Privacy-First Toolbox',
    },
    
    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: tool.name,
      description: tool.description,
    },
    
    // Robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    
    // Alternates
    alternates: {
      canonical: `/tools/${tool.category}/${tool.slug}`,
    },
  };
}

// Generate JSON-LD structured data for SEO
function generateStructuredData(tool: NonNullable<ReturnType<typeof getToolBySlug>>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    description: tool.longDescription,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: tool.seo.features,
    browserRequirements: 'Requires JavaScript. Works in Chrome, Firefox, Safari, Edge.',
  };
}

// Generate FAQ structured data
function generateFAQStructuredData(tool: NonNullable<ReturnType<typeof getToolBySlug>>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: tool.seo.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export default async function ToolPage(props: PageProps) {
  const params = await props.params;
  const tool = getToolBySlug(params.slug);

  if (!tool) {
    notFound();
  }

  // Verify category matches
  if (tool.category !== params.category) {
    notFound();
  }

  const structuredData = generateStructuredData(tool);
  const faqStructuredData = generateFAQStructuredData(tool);

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      
      <ToolPageClient
        toolId={tool.id}
        title={tool.name}
        description={tool.longDescription}
        acceptedFormats={tool.acceptedFormats}
        maxFileSize={tool.maxFileSize}
      />
    </>
  );
}
