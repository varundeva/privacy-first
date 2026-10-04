import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getToolBySlug, toolsConfig } from '@/lib/tools-config';
import { ToolPageClient } from './client';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://privacyfirst.tools';

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
      images: [
        {
          url: `${BASE_URL}/api/og?title=${encodeURIComponent(tool.name)}&description=${encodeURIComponent(tool.description)}&category=${tool.category}&categoryLabel=${encodeURIComponent(tool.categoryLabel)}`,
          width: 1200,
          height: 630,
          alt: seo.title,
        },
      ],
    },

    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: tool.name,
      description: tool.description,
      images: [`${BASE_URL}/api/og?title=${encodeURIComponent(tool.name)}&description=${encodeURIComponent(tool.description)}&category=${tool.category}&categoryLabel=${encodeURIComponent(tool.categoryLabel)}`],
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

// Generate Breadcrumb structured data
function generateBreadcrumbSchema(tool: NonNullable<ReturnType<typeof getToolBySlug>>) {
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
      {
        '@type': 'ListItem',
        position: 3,
        name: tool.categoryLabel,
        item: `${BASE_URL}/tools/${tool.category}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: tool.name,
        item: `${BASE_URL}/tools/${tool.category}/${tool.slug}`,
      },
    ],
  };
}

// Generate HowTo structured data for converter / action tools
function generateHowToSchema(tool: NonNullable<ReturnType<typeof getToolBySlug>>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to use ${tool.name}`,
    description: `Step-by-step instructions for ${tool.name.toLowerCase()} securely on your device with no server upload.`,
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Select or input your file',
        text: tool.acceptedFormats.length > 0
          ? `Choose your ${tool.acceptedFormats.join(', ')} file to load directly into the browser.`
          : `Paste or enter your input into the tool interface.`,
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Adjust preferences',
        text: 'Configure your desired conversion, format, or compression settings.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Download your result',
        text: 'Processing completes in your browser via Web Workers. Download your file instantly with complete data privacy.',
      },
    ],
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
  const breadcrumbSchema = generateBreadcrumbSchema(tool);
  const howToSchema = generateHowToSchema(tool);

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      <ToolPageClient
        toolId={tool.id}
        title={tool.name}
        description={tool.longDescription}
        acceptedFormats={tool.acceptedFormats}
        maxFileSize={tool.maxFileSize}
        features={tool.seo.features}
        useCases={tool.seo.useCases}
        faq={tool.seo.faq}
        category={tool.category}
        categoryLabel={tool.categoryLabel}
      />
    </>
  );
}
