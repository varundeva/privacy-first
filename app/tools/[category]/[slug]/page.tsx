import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getToolBySlug } from '@/lib/tools-config';
import { ToolShellClient } from '@/components/tools/ToolShellClient';
import { ImageConverter } from '@/components/tools/ImageConverter';

interface PageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
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
    title: `${tool.name} - Free Online Tool`,
    description: tool.longDescription,
    keywords: tool.keywords.join(', '),
    openGraph: {
      title: `${tool.name} - Free Online Tool`,
      description: tool.longDescription,
      type: 'website',
    },
  };
}

export default async function ToolPage(props: PageProps) {
  const params = await props.params;
  const tool = getToolBySlug(params.slug);

  if (!tool) {
    notFound();
  }

  return (
    <ToolShellClient
      title={tool.name}
      description={tool.longDescription}
      acceptedFormats={tool.acceptedFormats}
      maxFileSize={tool.maxFileSize}
    >
      <ImageConverter />
    </ToolShellClient>
  );
}
