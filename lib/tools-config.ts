/**
 * Tools Configuration
 * 
 * Central registry for all tools with comprehensive SEO metadata.
 * Each tool has unique, SEO-optimized content for maximum search visibility.
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
  icon: string;
  acceptedFormats: string[];
  maxFileSize: number;
  // SEO-specific fields
  seo: {
    title: string;
    metaDescription: string;
    h1: string;
    features: string[];
    useCases: string[];
    faq: { question: string; answer: string }[];
  };
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
// Tools Registry with SEO Metadata
// ============================================

export const toolsConfig: Tool[] = [
  // ─────────────────────────────────────────
  // JPG/JPEG Converters
  // ─────────────────────────────────────────
  {
    id: 'jpg-to-png',
    name: 'JPG to PNG',
    slug: 'jpg-to-png',
    category: 'image',
    categoryLabel: 'Image Tools',
    description: 'Convert JPG images to PNG format with transparency support',
    longDescription: 'Free online JPG to PNG converter. Transform your JPEG images to PNG format instantly in your browser. Perfect for adding transparency, preserving quality for graphics, and creating web-ready images.',
    keywords: ['jpg to png', 'jpeg to png', 'convert jpg to png', 'jpg png converter', 'image converter', 'free online converter', 'transparent png'],
    icon: 'Image',
    acceptedFormats: ['.jpg', '.jpeg'],
    maxFileSize: 50,
    seo: {
      title: 'JPG to PNG Converter - Free Online Image Converter | No Upload Required',
      metaDescription: 'Convert JPG to PNG online for free. No upload needed - your images stay private. Add transparency support, preserve quality, and download instantly.',
      h1: 'Convert JPG to PNG Online - Free & Private',
      features: [
        'Instant conversion in your browser',
        'No file upload - 100% private',
        'Preserves image quality',
        'Supports transparency',
        'Works offline',
        'No registration required',
      ],
      useCases: [
        'Add transparency to images',
        'Create logos and graphics',
        'Prepare images for web design',
        'Convert photos for editing software',
      ],
      faq: [
        {
          question: 'Is my image uploaded to a server?',
          answer: 'No! Your image is processed entirely in your browser. It never leaves your device.',
        },
        {
          question: 'Will converting to PNG increase file size?',
          answer: 'PNG files are typically larger than JPG because they use lossless compression. However, they preserve all image quality and support transparency.',
        },
        {
          question: 'Can I convert multiple images at once?',
          answer: 'Currently, you can convert one image at a time. Batch conversion is coming soon!',
        },
      ],
    },
  },

  {
    id: 'jpg-to-webp',
    name: 'JPG to WebP',
    slug: 'jpg-to-webp',
    category: 'image',
    categoryLabel: 'Image Tools',
    description: 'Convert JPG to WebP for smaller file sizes and faster websites',
    longDescription: 'Convert your JPEG images to modern WebP format. Reduce file sizes by 25-35% while maintaining quality. Perfect for web optimization and faster page loading.',
    keywords: ['jpg to webp', 'jpeg to webp', 'convert jpg to webp', 'webp converter', 'image optimization', 'web performance', 'compress images'],
    icon: 'Image',
    acceptedFormats: ['.jpg', '.jpeg'],
    maxFileSize: 50,
    seo: {
      title: 'JPG to WebP Converter - Optimize Images for Web | Free Online Tool',
      metaDescription: 'Convert JPG to WebP for 25-35% smaller files. Free online converter that runs in your browser. Optimize images for faster websites.',
      h1: 'Convert JPG to WebP - Optimize for Web Performance',
      features: [
        '25-35% smaller than JPEG',
        'Maintains visual quality',
        'Supported by all modern browsers',
        'Browser-based processing',
        'Instant download',
        'No quality loss',
      ],
      useCases: [
        'Website image optimization',
        'Reduce page load times',
        'Save storage space',
        'Improve Core Web Vitals',
      ],
      faq: [
        {
          question: 'What is WebP format?',
          answer: 'WebP is a modern image format developed by Google that provides superior compression. It creates files 25-35% smaller than JPEG with equivalent quality.',
        },
        {
          question: 'Do all browsers support WebP?',
          answer: 'Yes! All modern browsers including Chrome, Firefox, Safari, and Edge support WebP. Only very old browsers lack support.',
        },
        {
          question: 'Is WebP better than JPEG?',
          answer: 'For web use, yes! WebP offers better compression, smaller file sizes, and supports transparency and animation.',
        },
      ],
    },
  },

  // ─────────────────────────────────────────
  // PNG Converters
  // ─────────────────────────────────────────
  {
    id: 'png-to-jpg',
    name: 'PNG to JPG',
    slug: 'png-to-jpg',
    category: 'image',
    categoryLabel: 'Image Tools',
    description: 'Convert PNG images to JPG format for smaller file sizes',
    longDescription: 'Free online PNG to JPG converter. Reduce file sizes while maintaining quality. Perfect for photos, sharing on social media, and email attachments.',
    keywords: ['png to jpg', 'png to jpeg', 'convert png to jpg', 'png jpg converter', 'reduce image size', 'compress png'],
    icon: 'Image',
    acceptedFormats: ['.png'],
    maxFileSize: 50,
    seo: {
      title: 'PNG to JPG Converter - Reduce File Size Online | Free & Private',
      metaDescription: 'Convert PNG to JPG online for free. Reduce file sizes significantly while keeping great quality. No upload - works in your browser.',
      h1: 'Convert PNG to JPG - Reduce File Size Instantly',
      features: [
        'Significantly smaller files',
        'High quality compression',
        'Perfect for photos',
        'No upload required',
        'Instant conversion',
        'Free forever',
      ],
      useCases: [
        'Reduce image file size',
        'Prepare for email attachments',
        'Social media sharing',
        'Save storage space',
      ],
      faq: [
        {
          question: 'Will I lose transparency when converting to JPG?',
          answer: 'Yes, JPG does not support transparency. Transparent areas will be converted to white background.',
        },
        {
          question: 'How much smaller will my file be?',
          answer: 'JPG files are typically 50-80% smaller than PNG files, especially for photographs.',
        },
        {
          question: 'Is there quality loss?',
          answer: 'Our converter uses high quality settings (92%) to minimize visible quality loss while achieving good compression.',
        },
      ],
    },
  },

  {
    id: 'png-to-webp',
    name: 'PNG to WebP',
    slug: 'png-to-webp',
    category: 'image',
    categoryLabel: 'Image Tools',
    description: 'Convert PNG to WebP for optimized web images with transparency',
    longDescription: 'Convert PNG images to WebP format. Get smaller file sizes while keeping transparency support. Ideal for web graphics, logos, and icons.',
    keywords: ['png to webp', 'convert png to webp', 'webp with transparency', 'optimize png', 'compress png', 'web graphics'],
    icon: 'Image',
    acceptedFormats: ['.png'],
    maxFileSize: 50,
    seo: {
      title: 'PNG to WebP Converter - Compress with Transparency | Free Online',
      metaDescription: 'Convert PNG to WebP and reduce file size while keeping transparency. Free browser-based converter - no upload needed.',
      h1: 'Convert PNG to WebP - Smaller Files with Transparency',
      features: [
        'Keeps transparency',
        '25-35% smaller than PNG',
        'Ideal for web graphics',
        'Lossless compression option',
        'Browser-based',
        'Private & secure',
      ],
      useCases: [
        'Optimize logos for web',
        'Compress icons and graphics',
        'Reduce website load time',
        'Create efficient web assets',
      ],
      faq: [
        {
          question: 'Does PNG to WebP keep transparency?',
          answer: 'Yes! WebP fully supports transparency (alpha channel) just like PNG.',
        },
        {
          question: 'How much smaller will my PNG become?',
          answer: 'WebP files are typically 25-35% smaller than equivalent PNG files while maintaining the same quality.',
        },
        {
          question: 'Should I use WebP for all images?',
          answer: 'For web use, yes! WebP offers the best balance of quality and file size. For archival or editing, PNG may be preferable.',
        },
      ],
    },
  },

  // ─────────────────────────────────────────
  // WebP Converters
  // ─────────────────────────────────────────
  {
    id: 'webp-to-png',
    name: 'WebP to PNG',
    slug: 'webp-to-png',
    category: 'image',
    categoryLabel: 'Image Tools',
    description: 'Convert WebP images to universally compatible PNG format',
    longDescription: 'Convert WebP images to PNG format for maximum compatibility. Perfect when you need to edit images in software that doesn\'t support WebP or need a universally accepted format.',
    keywords: ['webp to png', 'convert webp to png', 'webp converter', 'open webp file', 'webp to image'],
    icon: 'Image',
    acceptedFormats: ['.webp'],
    maxFileSize: 50,
    seo: {
      title: 'WebP to PNG Converter - Universal Compatibility | Free Online',
      metaDescription: 'Convert WebP to PNG for universal compatibility. Free online converter - no upload needed. Works with all software and platforms.',
      h1: 'Convert WebP to PNG - Maximum Compatibility',
      features: [
        'Universal format support',
        'Preserves transparency',
        'Lossless conversion',
        'Compatible with all software',
        'No upload needed',
        'Works offline',
      ],
      useCases: [
        'Edit in Photoshop/GIMP',
        'Share with legacy systems',
        'Print preparation',
        'Archive images',
      ],
      faq: [
        {
          question: 'Why convert WebP to PNG?',
          answer: 'PNG is universally supported by all image editors and systems. Some older software cannot open WebP files.',
        },
        {
          question: 'Is there quality loss in conversion?',
          answer: 'No! Both WebP and PNG support lossless encoding, so conversion preserves 100% of image quality.',
        },
        {
          question: 'Will the file be larger?',
          answer: 'Yes, PNG files are typically larger than WebP. This is the tradeoff for universal compatibility.',
        },
      ],
    },
  },

  {
    id: 'webp-to-jpg',
    name: 'WebP to JPG',
    slug: 'webp-to-jpg',
    category: 'image',
    categoryLabel: 'Image Tools',
    description: 'Convert WebP images to widely supported JPG format',
    longDescription: 'Convert WebP images to JPEG format. Perfect for sharing on platforms that don\'t support WebP, email attachments, and legacy system compatibility.',
    keywords: ['webp to jpg', 'webp to jpeg', 'convert webp', 'webp converter', 'save webp as jpg'],
    icon: 'Image',
    acceptedFormats: ['.webp'],
    maxFileSize: 50,
    seo: {
      title: 'WebP to JPG Converter - Share Anywhere | Free Online Tool',
      metaDescription: 'Convert WebP to JPG for universal sharing. Free browser-based converter - your images stay private. Download instantly.',
      h1: 'Convert WebP to JPG - Share on Any Platform',
      features: [
        'Maximum compatibility',
        'High quality output',
        'Small file sizes',
        'Perfect for sharing',
        'Browser-based',
        'No watermarks',
      ],
      useCases: [
        'Email attachments',
        'Social media sharing',
        'Legacy system support',
        'Printing services',
      ],
      faq: [
        {
          question: 'Why convert WebP to JPG?',
          answer: 'JPG is the most universally supported image format. Some email clients, social platforms, and software may not display WebP correctly.',
        },
        {
          question: 'Will I lose transparency?',
          answer: 'Yes, JPG doesn\'t support transparency. Any transparent areas will become white.',
        },
        {
          question: 'What quality setting is used?',
          answer: 'We use 92% quality for optimal balance between file size and visual quality.',
        },
      ],
    },
  },

  // ─────────────────────────────────────────
  // Other Format Converters
  // ─────────────────────────────────────────
  {
    id: 'bmp-to-png',
    name: 'BMP to PNG',
    slug: 'bmp-to-png',
    category: 'image',
    categoryLabel: 'Image Tools',
    description: 'Convert BMP bitmap images to compressed PNG format',
    longDescription: 'Convert large BMP files to compressed PNG format. Dramatically reduce file sizes while preserving perfect image quality. Ideal for modernizing old image archives.',
    keywords: ['bmp to png', 'convert bmp to png', 'bmp converter', 'compress bmp', 'bitmap to png'],
    icon: 'Image',
    acceptedFormats: ['.bmp'],
    maxFileSize: 100,
    seo: {
      title: 'BMP to PNG Converter - Compress Bitmap Images | Free Online',
      metaDescription: 'Convert BMP to PNG and reduce file size by up to 90%. Free online converter - no upload needed. Preserve quality while saving space.',
      h1: 'Convert BMP to PNG - Massive File Size Reduction',
      features: [
        'Up to 90% smaller files',
        'Lossless compression',
        'Perfect quality',
        'Web-compatible output',
        'Browser-based',
        'Free forever',
      ],
      useCases: [
        'Compress old screenshots',
        'Modernize image archives',
        'Prepare BMP for web',
        'Email large images',
      ],
      faq: [
        {
          question: 'How much smaller will my BMP become?',
          answer: 'PNG compression can reduce BMP files by 70-90% depending on image content, with no quality loss.',
        },
        {
          question: 'Why are BMP files so large?',
          answer: 'BMP (Bitmap) stores pixel data uncompressed. PNG uses lossless compression to achieve much smaller sizes.',
        },
        {
          question: 'Is there any quality difference?',
          answer: 'No! PNG uses lossless compression, meaning the converted image is pixel-perfect identical to the original.',
        },
      ],
    },
  },

  {
    id: 'gif-to-png',
    name: 'GIF to PNG',
    slug: 'gif-to-png',
    category: 'image',
    categoryLabel: 'Image Tools',
    description: 'Convert GIF images to PNG with better color depth',
    longDescription: 'Convert GIF images to PNG format. Get better color depth (16 million colors vs 256) and extract still frames from animated GIFs. Perfect for creating thumbnails.',
    keywords: ['gif to png', 'convert gif to png', 'gif converter', 'extract gif frame', 'animated gif to image'],
    icon: 'Image',
    acceptedFormats: ['.gif'],
    maxFileSize: 50,
    seo: {
      title: 'GIF to PNG Converter - Better Colors & Still Frames | Free Online',
      metaDescription: 'Convert GIF to PNG for better color depth and extract frames from animations. Free browser-based tool - no upload required.',
      h1: 'Convert GIF to PNG - Enhanced Quality & Frame Extraction',
      features: [
        'Full color depth (16M colors)',
        'Extract animation frames',
        'Better transparency handling',
        'Higher quality output',
        'Browser-based',
        'Instant processing',
      ],
      useCases: [
        'Create thumbnails from GIFs',
        'Get better color quality',
        'Extract key animation frames',
        'Edit in image software',
      ],
      faq: [
        {
          question: 'What happens with animated GIFs?',
          answer: 'The converter extracts the first frame of the animation. Multi-frame extraction is coming soon!',
        },
        {
          question: 'Why convert GIF to PNG?',
          answer: 'GIF is limited to 256 colors. PNG supports 16 million colors for much better quality static images.',
        },
        {
          question: 'Will the file be larger?',
          answer: 'It depends on the image. Simple graphics may be larger in PNG; complex images with gradients will have similar or smaller size.',
        },
      ],
    },
  },
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

export function getAllTools(): Tool[] {
  return toolsConfig;
}
