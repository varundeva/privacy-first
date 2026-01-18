import React from "react"

/**
 * Tools Configuration
 * 
 * This is the central registry for all tools in the platform.
 * Each tool defines its metadata, accepted formats, and component to render.
 * 
 * To add a new tool:
 * 1. Create the tool component in /components/tools/[category]/
 * 2. Add an entry to toolsConfig below
 * 3. The tool will automatically appear on the homepage and have a dedicated page
 */

export interface Tool {
  id: string;
  name: string;
  slug: string;
  category: ToolCategoryId;
  categoryLabel: string;
  description: string;
  longDescription: string;
  keywords: string[];
  icon: string; // Lucide icon name
  componentPath: string; // Path to component for documentation
  acceptedFormats: string[];
  maxFileSize: number; // in MB
}

export type ToolCategoryId = 'image' | 'pdf' | 'text' | 'video' | 'audio';

export interface ToolCategory {
  id: ToolCategoryId;
  label: string;
  description: string;
  icon: string;
  color: string;
}

// ============================================
// Tool Categories
// ============================================

export const toolCategories: ToolCategory[] = [
  {
    id: 'image',
    label: 'Image Tools',
    description: 'Convert, compress, and manipulate images',
    icon: 'Image',
    color: 'bg-blue-500',
  },
  {
    id: 'pdf',
    label: 'PDF Tools',
    description: 'Split, merge, and convert PDF files',
    icon: 'FileText',
    color: 'bg-red-500',
  },
  {
    id: 'text',
    label: 'Text Tools',
    description: 'Text formatting, conversion, and analysis',
    icon: 'Type',
    color: 'bg-green-500',
  },
  {
    id: 'video',
    label: 'Video Tools',
    description: 'Video conversion and manipulation',
    icon: 'Video',
    color: 'bg-purple-500',
  },
  {
    id: 'audio',
    label: 'Audio Tools',
    description: 'Audio conversion and editing',
    icon: 'Music',
    color: 'bg-orange-500',
  },
];

// ============================================
// Tools Registry
// ============================================

export const toolsConfig: Tool[] = [
  // ─────────────────────────────────────────
  // Image Tools
  // ─────────────────────────────────────────
  {
    id: 'jpg-to-png',
    name: 'JPG to PNG',
    slug: 'jpg-to-png',
    category: 'image',
    categoryLabel: 'Image Tools',
    description: 'Convert JPG images to PNG format',
    longDescription: 'Convert your JPG images to PNG format with full quality preservation. PNG supports transparency and is perfect for graphics, logos, and images with text.',
    keywords: ['jpg', 'jpeg', 'png', 'convert', 'image', 'format', 'conversion', 'transparency'],
    icon: 'Image',
    componentPath: '@/components/tools/image/JpgToPngConverter',
    acceptedFormats: ['.jpg', '.jpeg'],
    maxFileSize: 50,
  },

  // Future tools can be added here:
  // {
  //   id: 'png-to-jpg',
  //   name: 'PNG to JPG',
  //   slug: 'png-to-jpg',
  //   category: 'image',
  //   ...
  // },
];

// ============================================
// Helper Functions
// ============================================

export function getToolBySlug(slug: string): Tool | undefined {
  return toolsConfig.find((tool) => tool.slug === slug);
}

export function getToolsByCategory(category: ToolCategoryId): Tool[] {
  return toolsConfig.filter((tool) => tool.category === category);
}

export function getAllCategories(): ToolCategory[] {
  return toolCategories;
}

export function getCategoryById(id: ToolCategoryId): ToolCategory | undefined {
  return toolCategories.find((cat) => cat.id === id);
}

export function getCategoryLabel(categoryId: ToolCategoryId): string {
  return toolCategories.find((cat) => cat.id === categoryId)?.label || categoryId;
}

export function getToolsGroupedByCategory(): Map<ToolCategoryId, Tool[]> {
  const grouped = new Map<ToolCategoryId, Tool[]>();

  for (const tool of toolsConfig) {
    const existing = grouped.get(tool.category) || [];
    grouped.set(tool.category, [...existing, tool]);
  }

  return grouped;
}
