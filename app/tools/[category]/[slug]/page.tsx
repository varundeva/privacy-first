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

// Generate static params for all tools
export async function generateStaticParams() {
  return toolsConfig.map((tool) => ({
    category: tool.category,
    slug: tool.slug,
  }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const tool = getToolBySlug(params.slug);

  if (!tool) {
    return {
      title: 'Tool Not Found',
      description: 'The requested tool does not exist.',
    };
  }

  return {
    title: `${tool.name} - Free Online Tool | Privacy-First Toolbox`,
    description: tool.longDescription,
    keywords: tool.keywords.join(', '),
    openGraph: {
      title: `${tool.name} - Free Online Tool`,
      description: tool.longDescription,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.name,
      description: tool.description,
    },
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

  return (
    <ToolPageClient
      toolId={tool.id}
      title={tool.name}
      description={tool.longDescription}
      acceptedFormats={tool.acceptedFormats}
      maxFileSize={tool.maxFileSize}
    />
  );
}
