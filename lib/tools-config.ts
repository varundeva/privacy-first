import React from "react"
import dynamic from "next/dynamic"

export interface Tool {
  id: string;
  name: string;
  slug: string;
  category: 'image' | 'pdf' | 'text' | 'video' | 'audio';
  categoryLabel: string;
  description: string;
  longDescription: string;
  keywords: string[];
  icon: string;
  component: React.ComponentType<any>;
  acceptedFormats: string[];
  maxFileSize: number; // in MB
}

export interface ToolCategory {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: string;
}

// Lazy-loaded tool components using Next.js dynamic imports
const ImageConverter = dynamic(
  () => import('@/components/tools/ImageConverter').then((mod) => mod.ImageConverter),
  {
    loading: () => React.createElement('div', { className: 'animate-pulse bg-muted h-64 rounded-lg' }),
  }
);

// Tools registry - This is where you register all available tools
export const toolsConfig: Tool[] = [
  {
    id: 'jpg-to-png',
    name: 'JPG to PNG',
    slug: 'jpg-to-png',
    category: 'image',
    categoryLabel: 'Image Tools',
    description: 'Convert JPG images to PNG format',
    longDescription: 'Convert your JPG images to PNG format with full quality preservation. Perfect for images that need transparency support.',
    keywords: ['jpg', 'png', 'convert', 'image', 'format', 'conversion'],
    icon: 'image',
    component: ImageConverter,
    acceptedFormats: ['.jpg', '.jpeg'],
    maxFileSize: 50,
  },
  // Add more tools here following the same pattern
];

export const toolCategories: ToolCategory[] = [
  {
    id: 'image',
    label: 'Image Tools',
    description: 'Convert, compress, and manipulate images',
    icon: 'image',
    color: 'bg-blue-500',
  },
  {
    id: 'pdf',
    label: 'PDF Tools',
    description: 'Split, merge, and convert PDF files',
    icon: 'file-pdf',
    color: 'bg-red-500',
  },
  {
    id: 'text',
    label: 'Text Tools',
    description: 'Text formatting, conversion, and analysis',
    icon: 'type',
    color: 'bg-green-500',
  },
  {
    id: 'video',
    label: 'Video Tools',
    description: 'Video conversion and manipulation',
    icon: 'video',
    color: 'bg-purple-500',
  },
  {
    id: 'audio',
    label: 'Audio Tools',
    description: 'Audio conversion and editing',
    icon: 'music',
    color: 'bg-orange-500',
  },
];

// Helper functions
export function getToolBySlug(slug: string): Tool | undefined {
  return toolsConfig.find((tool) => tool.slug === slug);
}

export function getToolsByCategory(category: string): Tool[] {
  return toolsConfig.filter((tool) => tool.category === category);
}

export function getAllCategories(): ToolCategory[] {
  return toolCategories;
}

export function getCategoryLabel(categoryId: string): string {
  return toolCategories.find((cat) => cat.id === categoryId)?.label || categoryId;
}
