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

  // ─────────────────────────────────────────
  // Additional GIF Converters
  // ─────────────────────────────────────────
  {
    id: 'gif-to-jpg',
    name: 'GIF to JPG',
    slug: 'gif-to-jpg',
    category: 'image',
    categoryLabel: 'Image Tools',
    description: 'Convert GIF images to JPG format for universal compatibility',
    longDescription: 'Convert GIF images to JPEG format. Extract still frames from animated GIFs and save them in the most widely supported image format. Perfect for thumbnails and sharing.',
    keywords: ['gif to jpg', 'gif to jpeg', 'convert gif', 'gif converter', 'animated gif to jpg', 'extract gif frame'],
    icon: 'Image',
    acceptedFormats: ['.gif'],
    maxFileSize: 50,
    seo: {
      title: 'GIF to JPG Converter - Extract Frames to JPEG | Free Online',
      metaDescription: 'Convert GIF to JPG online for free. Extract frames from animated GIFs and save as JPEG. Browser-based, no upload needed.',
      h1: 'Convert GIF to JPG - Extract & Share',
      features: [
        'Extract first frame',
        'Universal compatibility',
        'High quality output',
        'Small file sizes',
        'Browser-based',
        'Free forever',
      ],
      useCases: [
        'Create thumbnails',
        'Share on any platform',
        'Email compatibility',
        'Print services',
      ],
      faq: [
        {
          question: 'What happens to animated GIFs?',
          answer: 'The converter extracts the first frame of the animation and saves it as a JPG image.',
        },
        {
          question: 'Will I lose transparency?',
          answer: 'Yes, JPG does not support transparency. Transparent areas become white.',
        },
        {
          question: 'Is the quality good?',
          answer: 'We use 92% quality setting for optimal balance between file size and visual quality.',
        },
      ],
    },
  },

  {
    id: 'gif-to-webp',
    name: 'GIF to WebP',
    slug: 'gif-to-webp',
    category: 'image',
    categoryLabel: 'Image Tools',
    description: 'Convert GIF images to modern WebP format',
    longDescription: 'Convert GIF images to WebP format for modern web use. Extract still frames from animated GIFs and save in an optimized format perfect for websites.',
    keywords: ['gif to webp', 'convert gif to webp', 'gif converter', 'optimize gif', 'web optimization'],
    icon: 'Image',
    acceptedFormats: ['.gif'],
    maxFileSize: 50,
    seo: {
      title: 'GIF to WebP Converter - Modern Format | Free Online Tool',
      metaDescription: 'Convert GIF to WebP for better web performance. Extract frames from animated GIFs. Free browser-based converter.',
      h1: 'Convert GIF to WebP - Web Optimized',
      features: [
        'Modern web format',
        'Smaller file sizes',
        'Great quality',
        'Extract animation frames',
        'Browser-based',
        'No upload needed',
      ],
      useCases: [
        'Web optimization',
        'Create thumbnails',
        'Modern website images',
        'Performance improvement',
      ],
      faq: [
        {
          question: 'Is WebP better than GIF?',
          answer: 'For static images, WebP offers much better compression and quality. For animations, animated WebP can also be smaller.',
        },
        {
          question: 'Do all browsers support WebP?',
          answer: 'Yes! All modern browsers support WebP including Chrome, Firefox, Safari, and Edge.',
        },
        {
          question: 'What about the animation?',
          answer: 'This tool extracts the first frame. Animated WebP conversion is coming soon!',
        },
      ],
    },
  },

  // ─────────────────────────────────────────
  // Additional BMP Converters
  // ─────────────────────────────────────────
  {
    id: 'bmp-to-jpg',
    name: 'BMP to JPG',
    slug: 'bmp-to-jpg',
    category: 'image',
    categoryLabel: 'Image Tools',
    description: 'Convert BMP bitmap images to compressed JPG format',
    longDescription: 'Convert large BMP files to compressed JPEG format. Dramatically reduce file sizes while maintaining good visual quality. Ideal for sharing and web use.',
    keywords: ['bmp to jpg', 'bmp to jpeg', 'convert bmp', 'bitmap converter', 'compress bmp', 'bmp to image'],
    icon: 'Image',
    acceptedFormats: ['.bmp'],
    maxFileSize: 100,
    seo: {
      title: 'BMP to JPG Converter - Compress Bitmap to JPEG | Free Online',
      metaDescription: 'Convert BMP to JPG and reduce file size by up to 95%. Free online converter - no upload needed. Preserve quality while saving space.',
      h1: 'Convert BMP to JPG - Maximum Compression',
      features: [
        'Up to 95% smaller files',
        'High quality output',
        'Fast conversion',
        'Web-ready format',
        'Browser-based',
        'Free forever',
      ],
      useCases: [
        'Compress screenshots',
        'Share large images',
        'Email attachments',
        'Web publishing',
      ],
      faq: [
        {
          question: 'How much smaller will my BMP become?',
          answer: 'JPG compression can reduce BMP files by 90-95%, making them much easier to share and store.',
        },
        {
          question: 'Is there quality loss?',
          answer: 'JPG uses lossy compression, but at 92% quality the difference is usually imperceptible.',
        },
        {
          question: 'Why are BMP files so large?',
          answer: 'BMP stores every pixel uncompressed. A 1920x1080 image can be 6MB+ as BMP but under 500KB as JPG.',
        },
      ],
    },
  },

  {
    id: 'bmp-to-webp',
    name: 'BMP to WebP',
    slug: 'bmp-to-webp',
    category: 'image',
    categoryLabel: 'Image Tools',
    description: 'Convert BMP bitmap images to modern WebP format',
    longDescription: 'Convert large BMP files to modern WebP format. Achieve maximum compression with excellent quality. The best choice for web optimization.',
    keywords: ['bmp to webp', 'convert bmp to webp', 'bitmap to webp', 'compress bmp', 'web optimization'],
    icon: 'Image',
    acceptedFormats: ['.bmp'],
    maxFileSize: 100,
    seo: {
      title: 'BMP to WebP Converter - Maximum Compression | Free Online',
      metaDescription: 'Convert BMP to WebP for the smallest possible file size. Free browser-based converter. Perfect for web optimization.',
      h1: 'Convert BMP to WebP - Ultimate Compression',
      features: [
        'Maximum compression',
        'Excellent quality',
        'Modern format',
        'Web optimized',
        'Browser-based',
        'No upload needed',
      ],
      useCases: [
        'Web optimization',
        'Compress old images',
        'Modernize archives',
        'Reduce storage',
      ],
      faq: [
        {
          question: 'Why choose WebP over JPG?',
          answer: 'WebP typically produces 25-35% smaller files than JPG at equivalent quality, making it ideal for web use.',
        },
        {
          question: 'How much will my BMP shrink?',
          answer: 'Converting BMP to WebP can reduce file size by 95% or more, depending on image content.',
        },
        {
          question: 'Is WebP widely supported?',
          answer: 'Yes! All modern browsers and many applications now support WebP.',
        },
      ],
    },
  },

  // ─────────────────────────────────────────
  // SVG Converters (Rasterize)
  // ─────────────────────────────────────────
  {
    id: 'svg-to-png',
    name: 'SVG to PNG',
    slug: 'svg-to-png',
    category: 'image',
    categoryLabel: 'Image Tools',
    description: 'Convert SVG vector graphics to PNG bitmap images',
    longDescription: 'Rasterize SVG vector graphics to PNG format. Convert scalable vector files to fixed-resolution bitmap images. Perfect for when you need a standard image format.',
    keywords: ['svg to png', 'convert svg', 'svg converter', 'rasterize svg', 'vector to bitmap', 'svg to image'],
    icon: 'Image',
    acceptedFormats: ['.svg'],
    maxFileSize: 10,
    seo: {
      title: 'SVG to PNG Converter - Rasterize Vector Graphics | Free Online',
      metaDescription: 'Convert SVG to PNG online for free. Rasterize vector graphics to bitmap images. Browser-based, no upload needed.',
      h1: 'Convert SVG to PNG - Rasterize Vectors',
      features: [
        'High quality output',
        'Preserves details',
        'Transparency support',
        'Instant conversion',
        'Browser-based',
        'Free forever',
      ],
      useCases: [
        'Use in non-vector software',
        'Create social media images',
        'Email logos',
        'Print preparation',
      ],
      faq: [
        {
          question: 'What resolution will my PNG be?',
          answer: 'The PNG will match the SVG\'s defined dimensions. For best results, ensure your SVG has appropriate width/height.',
        },
        {
          question: 'Will I lose scalability?',
          answer: 'Yes, PNG is a bitmap format. Once converted, the image cannot be scaled without quality loss. Keep your original SVG for future use.',
        },
        {
          question: 'Does it support transparency?',
          answer: 'Yes! PNG fully supports transparency, so your SVG\'s transparent areas will be preserved.',
        },
      ],
    },
  },

  {
    id: 'svg-to-jpg',
    name: 'SVG to JPG',
    slug: 'svg-to-jpg',
    category: 'image',
    categoryLabel: 'Image Tools',
    description: 'Convert SVG vector graphics to JPG for universal sharing',
    longDescription: 'Rasterize SVG vector graphics to JPEG format. Convert scalable vectors to the most universally supported image format. Ideal for sharing and email.',
    keywords: ['svg to jpg', 'svg to jpeg', 'convert svg', 'vector to jpg', 'rasterize svg'],
    icon: 'Image',
    acceptedFormats: ['.svg'],
    maxFileSize: 10,
    seo: {
      title: 'SVG to JPG Converter - Vector to JPEG | Free Online Tool',
      metaDescription: 'Convert SVG to JPG for universal compatibility. Rasterize vector graphics to JPEG. Free browser-based converter.',
      h1: 'Convert SVG to JPG - Universal Format',
      features: [
        'Universal compatibility',
        'Compact file size',
        'High quality',
        'Fast conversion',
        'Browser-based',
        'No upload needed',
      ],
      useCases: [
        'Share on any platform',
        'Email attachments',
        'Social media images',
        'Document embedding',
      ],
      faq: [
        {
          question: 'What happens to transparency?',
          answer: 'JPG doesn\'t support transparency. Transparent areas will be converted to a white background.',
        },
        {
          question: 'What size will my image be?',
          answer: 'The JPG will match your SVG\'s defined width and height dimensions.',
        },
        {
          question: 'Is the quality good?',
          answer: 'Yes! We use 92% quality setting for excellent visual quality with reasonable file size.',
        },
      ],
    },
  },

  {
    id: 'svg-to-webp',
    name: 'SVG to WebP',
    slug: 'svg-to-webp',
    category: 'image',
    categoryLabel: 'Image Tools',
    description: 'Convert SVG vector graphics to modern WebP format',
    longDescription: 'Rasterize SVG vector graphics to WebP format. Create optimized web-ready images from vector files. Best choice for web performance with quality output.',
    keywords: ['svg to webp', 'convert svg to webp', 'vector to webp', 'rasterize svg', 'web optimization'],
    icon: 'Image',
    acceptedFormats: ['.svg'],
    maxFileSize: 10,
    seo: {
      title: 'SVG to WebP Converter - Modern Web Format | Free Online',
      metaDescription: 'Convert SVG to WebP for optimal web performance. Rasterize vectors to modern format. Free browser-based tool.',
      h1: 'Convert SVG to WebP - Web Optimized',
      features: [
        'Modern format',
        'Excellent compression',
        'Transparency support',
        'Web optimized',
        'Browser-based',
        'Free forever',
      ],
      useCases: [
        'Web optimization',
        'Modern websites',
        'Performance focused',
        'App images',
      ],
      faq: [
        {
          question: 'Why convert SVG to WebP instead of using SVG?',
          answer: 'Some contexts don\'t support SVG (emails, certain apps). WebP offers great compression while maintaining quality.',
        },
        {
          question: 'Does WebP support transparency like SVG?',
          answer: 'Yes! WebP fully supports transparency (alpha channel), unlike JPG.',
        },
        {
          question: 'What about scalability?',
          answer: 'Unlike SVG, WebP is a bitmap format. Keep your original SVG for cases where scalability is needed.',
        },
      ],
    },
  },

  // ─────────────────────────────────────────
  // ICO Converter
  // ─────────────────────────────────────────
  {
    id: 'ico-to-png',
    name: 'ICO to PNG',
    slug: 'ico-to-png',
    category: 'image',
    categoryLabel: 'Image Tools',
    description: 'Convert Windows ICO icon files to PNG format',
    longDescription: 'Convert Windows icon files to PNG format. Extract icon images for web design, graphic design, and general use. Perfect for using icons in your projects.',
    keywords: ['ico to png', 'convert ico', 'icon converter', 'windows icon', 'favicon to png', 'icon to image'],
    icon: 'Image',
    acceptedFormats: ['.ico'],
    maxFileSize: 5,
    seo: {
      title: 'ICO to PNG Converter - Convert Icons to PNG | Free Online',
      metaDescription: 'Convert ICO to PNG online for free. Extract Windows icons to PNG format. Browser-based, no upload needed.',
      h1: 'Convert ICO to PNG - Extract Icons',
      features: [
        'Extract icon images',
        'PNG with transparency',
        'High quality output',
        'Instant conversion',
        'Browser-based',
        'Free forever',
      ],
      useCases: [
        'Web design projects',
        'Graphic design',
        'Extract favicons',
        'Documentation',
      ],
      faq: [
        {
          question: 'What if my ICO has multiple sizes?',
          answer: 'The browser will use the largest/best quality version available in the ICO file.',
        },
        {
          question: 'Is transparency preserved?',
          answer: 'Yes! PNG supports transparency, so icon transparency is fully preserved.',
        },
        {
          question: 'Can I convert favicons?',
          answer: 'Yes! Favicons are ICO files, and this tool converts them to PNG perfectly.',
        },
      ],
    },
  },

  // ─────────────────────────────────────────
  // Image Metadata & Utilities
  // ─────────────────────────────────────────
  {
    id: 'image-metadata',
    name: 'Image Metadata Viewer',
    slug: 'image-metadata',
    category: 'image',
    categoryLabel: 'Image Tools',
    description: 'View detailed metadata and properties of your images',
    longDescription: 'Free online image metadata viewer. See file info, dimensions, color depth, and more. Analyze image properties instantly in your browser without uploading.',
    keywords: ['image metadata', 'image properties', 'image info', 'exif viewer', 'image analyzer', 'image dimensions'],
    icon: 'Info',
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.ico'],
    maxFileSize: 50,
    seo: {
      title: 'Image Metadata Viewer - View Image Properties | Free Online',
      metaDescription: 'View image metadata online for free. See dimensions, file size, color info, and more. 100% private - no upload required.',
      h1: 'Image Metadata Viewer - Analyze Images',
      features: [
        'View dimensions & size',
        'Color information',
        'Aspect ratio',
        'File type detection',
        'Copy values easily',
        '100% private',
      ],
      useCases: [
        'Check image dimensions',
        'Analyze file properties',
        'Verify image quality',
        'Debug image issues',
      ],
      faq: [
        {
          question: 'What metadata can I see?',
          answer: 'You can see file name, size, type, dimensions, aspect ratio, megapixels, color depth, and transparency info.',
        },
        {
          question: 'Does this read EXIF data?',
          answer: 'This viewer shows basic image properties. For detailed EXIF data (camera info, GPS), a specialized EXIF tool may be needed.',
        },
        {
          question: 'Is my image uploaded?',
          answer: 'No! Your image is processed entirely in your browser. It never leaves your device.',
        },
      ],
    },
  },
  {
    id: 'image-to-base64',
    name: 'Image to Base64',
    slug: 'image-to-base64',
    category: 'image',
    categoryLabel: 'Image Tools',
    description: 'Convert images to Base64 encoded strings',
    longDescription: 'Free online image to Base64 converter. Convert any image to Data URL or raw Base64 string. Perfect for embedding images in HTML, CSS, or JSON. All processing happens in your browser.',
    keywords: ['image to base64', 'convert image to base64', 'base64 encoder', 'data url', 'embed image', 'inline image'],
    icon: 'Code',
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.ico'],
    maxFileSize: 10,
    seo: {
      title: 'Image to Base64 Converter - Encode Images | Free Online',
      metaDescription: 'Convert images to Base64 online for free. Get Data URL, HTML img tag, or CSS code. Perfect for embedding images. 100% private.',
      h1: 'Convert Image to Base64',
      features: [
        'Data URL output',
        'Raw Base64 string',
        'HTML img tag',
        'CSS background code',
        'Copy & download',
        '100% private',
      ],
      useCases: [
        'Embed in HTML/CSS',
        'Store in databases',
        'Send via APIs',
        'Reduce HTTP requests',
      ],
      faq: [
        {
          question: 'Why use Base64 for images?',
          answer: 'Base64 lets you embed images directly in HTML/CSS/JSON, reducing HTTP requests and simplifying deployment.',
        },
        {
          question: 'Does Base64 increase file size?',
          answer: 'Yes, Base64 encoding increases size by about 33%. It is best for small images like icons.',
        },
        {
          question: 'What formats are supported?',
          answer: 'All common image formats: JPG, PNG, GIF, WebP, BMP, SVG, and ICO.',
        },
      ],
    },
  },
  {
    id: 'base64-to-image',
    name: 'Base64 to Image',
    slug: 'base64-to-image',
    category: 'image',
    categoryLabel: 'Image Tools',
    description: 'Convert Base64 strings back to image files',
    longDescription: 'Free online Base64 to image converter. Decode Base64 strings or Data URLs back to downloadable images. Supports PNG, JPEG, and WebP output formats.',
    keywords: ['base64 to image', 'decode base64', 'base64 decoder', 'data url to image', 'convert base64 to png'],
    icon: 'Image',
    acceptedFormats: [],
    maxFileSize: 10,
    seo: {
      title: 'Base64 to Image Converter - Decode Base64 | Free Online',
      metaDescription: 'Convert Base64 to image online for free. Decode Base64 strings to PNG, JPEG, or WebP. Preview and download instantly. 100% private.',
      h1: 'Convert Base64 to Image',
      features: [
        'Paste Base64 string',
        'Supports data URLs',
        'Auto-detect format',
        'Download as PNG/JPEG/WebP',
        'Preview before download',
        '100% private',
      ],
      useCases: [
        'Decode embedded images',
        'Extract from APIs',
        'Debug Base64 data',
        'Convert for editing',
      ],
      faq: [
        {
          question: 'What input formats work?',
          answer: 'Both raw Base64 strings and complete data URLs (data:image/...) are supported.',
        },
        {
          question: 'Can I choose output format?',
          answer: 'Yes! Download as PNG (best quality), JPEG (smaller size), or WebP (modern format).',
        },
        {
          question: 'Is my data secure?',
          answer: 'Yes! Everything is processed in your browser. No data is sent to any server.',
        },
      ],
    },
  },

  // ─────────────────────────────────────────
  // PDF Tools
  // ─────────────────────────────────────────
  {
    id: 'pdf-to-png',
    name: 'PDF to PNG',
    slug: 'pdf-to-png',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    description: 'Convert PDF document pages to high-quality PNG images',
    longDescription: 'Free online PDF to PNG converter. Extract pages from your PDF documents as high-resolution PNG images. Perfect for presentations, document sharing, and archiving. All processing happens in your browser.',
    keywords: ['pdf to png', 'pdf to image', 'convert pdf to png', 'extract pdf pages', 'pdf converter', 'pdf image extractor', 'free pdf converter'],
    icon: 'FileText',
    acceptedFormats: ['.pdf'],
    maxFileSize: 50,
    seo: {
      title: 'PDF to PNG Converter - Extract PDF Pages as Images | Free Online',
      metaDescription: 'Convert PDF to PNG online for free. Extract high-quality images from PDF pages. Browser-based, no upload needed. Perfect for presentations and sharing.',
      h1: 'Convert PDF to PNG - Extract Pages as Images',
      features: [
        'High-quality output',
        'All pages extracted',
        'Adjustable resolution',
        'Browser-based',
        'No file upload',
        'Free forever',
      ],
      useCases: [
        'Create presentation slides',
        'Share document pages',
        'Archive documents as images',
        'Extract PDF graphics',
      ],
      faq: [
        {
          question: 'What resolution are the PNG images?',
          answer: 'By default, we render at 2x scale (144 DPI) for excellent quality. This produces crisp images suitable for most use cases.',
        },
        {
          question: 'Can I convert specific pages only?',
          answer: 'Currently, all pages are converted. Page range selection is coming soon!',
        },
        {
          question: 'Is my PDF secure?',
          answer: 'Absolutely! Your PDF is processed entirely in your browser. No data is ever uploaded to any server.',
        },
        {
          question: 'What about password-protected PDFs?',
          answer: 'Password-protected PDFs are not currently supported. You\'ll need to remove the password first.',
        },
      ],
    },
  },
  {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG',
    slug: 'pdf-to-jpg',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    description: 'Convert PDF document pages to compressed JPG images',
    longDescription: 'Free online PDF to JPG converter. Extract pages from your PDF documents as compressed JPG images. Smaller file sizes than PNG, perfect for web sharing and email attachments. All processing happens in your browser.',
    keywords: ['pdf to jpg', 'pdf to jpeg', 'convert pdf to jpg', 'extract pdf pages', 'pdf converter', 'pdf image extractor', 'free pdf converter'],
    icon: 'FileText',
    acceptedFormats: ['.pdf'],
    maxFileSize: 50,
    seo: {
      title: 'PDF to JPG Converter - Extract PDF Pages as JPEG Images | Free Online',
      metaDescription: 'Convert PDF to JPG online for free. Extract compressed JPEG images from PDF pages. Smaller file sizes, perfect for sharing. Browser-based, no upload needed.',
      h1: 'Convert PDF to JPG - Extract Pages as JPEG Images',
      features: [
        'Compressed output',
        'Smaller file sizes',
        'All pages extracted',
        'Browser-based',
        'No file upload',
        'Free forever',
      ],
      useCases: [
        'Share via email',
        'Embed in documents',
        'Web publishing',
        'Social media sharing',
      ],
      faq: [
        {
          question: 'Why choose JPG over PNG?',
          answer: 'JPG files are smaller than PNG, making them ideal for sharing via email or uploading to websites. However, PNG preserves quality better for text-heavy documents.',
        },
        {
          question: 'What quality are the JPG images?',
          answer: 'We use 92% quality by default, which provides excellent visual quality while still achieving good compression.',
        },
        {
          question: 'Is my PDF secure?',
          answer: 'Absolutely! Your PDF is processed entirely in your browser. No data is ever uploaded to any server.',
        },
      ],
    },
  },
  {
    id: 'pdf-compress',
    name: 'PDF Compressor',
    slug: 'pdf-compress',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    description: 'Compress PDF files to reduce file size with customizable quality presets',
    longDescription: 'Free online PDF compressor. Reduce PDF file sizes with four compression presets: Extreme, High, Medium, and Low. Choose the perfect balance between file size and quality. All processing happens in your browser for maximum privacy.',
    keywords: ['pdf compressor', 'compress pdf', 'reduce pdf size', 'pdf compression', 'shrink pdf', 'optimize pdf', 'free pdf compressor', 'online pdf compressor'],
    icon: 'FileText',
    acceptedFormats: ['.pdf'],
    maxFileSize: 100,
    seo: {
      title: 'PDF Compressor - Reduce PDF Size Online | Free & Private',
      metaDescription: 'Compress PDF files online for free. Choose from 4 quality presets to reduce file size. Browser-based, no upload needed. 100% private and secure.',
      h1: 'Compress PDF - Reduce File Size Instantly',
      features: [
        '4 compression presets',
        'Adjustable quality levels',
        'No file upload needed',
        'Browser-based processing',
        '100% private & secure',
        'Free forever',
      ],
      useCases: [
        'Reduce PDF for email',
        'Optimize for web upload',
        'Save storage space',
        'Share large documents',
      ],
      faq: [
        {
          question: 'What are the compression presets?',
          answer: 'We offer 4 presets: Extreme (60-80% reduction), High (40-60%), Medium (20-40%), and Low (10-20%). Choose based on your needs for file size vs quality.',
        },
        {
          question: 'Will compression affect PDF quality?',
          answer: 'Higher compression levels may reduce image quality in the PDF. Text and vector graphics remain sharp. Use Low or Medium presets for documents with important images.',
        },
        {
          question: 'Is my PDF secure?',
          answer: 'Absolutely! Your PDF is processed entirely in your browser. No data is ever uploaded to any server.',
        },
        {
          question: 'What types of PDFs work best?',
          answer: 'PDFs with embedded images see the most compression. Text-only documents may not reduce as much since text is already efficient.',
        },
      ],
    },
  },
  {
    id: 'pdf-split',
    name: 'Split PDF',
    slug: 'pdf-split',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    description: 'Split PDF files and extract pages',
    longDescription: 'Free online PDF splitter. Extract pages from your PDF documents easily. Select pages visually or by page number. No quality loss - extracted pages maintain original quality. All processing happens in your browser.',
    keywords: ['split pdf', 'extract pdf pages', 'separate pdf pages', 'cut pdf', 'pdf splitter', 'free pdf splitter'],
    icon: 'Split',
    acceptedFormats: ['.pdf'],
    maxFileSize: 100,
    seo: {
      title: 'Split PDF - Extract Pages Online | Free & Private',
      metaDescription: 'Split PDF files online for free. Extract specific pages or ranges. Visual page selection. No quality loss. 100% private and secure.',
      h1: 'Split PDF - Extract Pages Accurately',
      features: [
        'Visual page selector',
        'Extract specific ranges',
        'No quality loss',
        'Browser-based processing',
        '100% private & secure',
        'Free forever',
      ],
      useCases: [
        'Extract specific chapters',
        'Remove unwanted pages',
        'Separate merged documents',
        'Create smaller PDFs',
      ],
      faq: [
        {
          question: 'Will splitting reduce quality?',
          answer: 'No! Our tool extracts the exact original pages without re-encoding, so 100% of the quality is preserved.',
        },
        {
          question: 'How do I select pages?',
          answer: 'You can click on the page thumbnails to select pages, or type ranges like "1-5, 8" in the input box.',
        },
        {
          question: 'Can I reorder pages?',
          answer: 'Currently this tool extracts pages in their original order. For reordering, use our upcoming Organize PDF tool.',
        },
      ],
    },
  },
  {
    id: 'pdf-merge',
    name: 'Merge PDF',
    slug: 'pdf-merge',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    description: 'Combine multiple PDF files into one document',
    longDescription: 'Free online PDF merger. Combine multiple PDF files into a single document. Drag and drop to reorder files. 100% private - all processing happens in your browser.',
    keywords: ['merge pdf', 'combine pdf', 'join pdf', 'pdf merger', 'combine pdf files', 'free pdf merger'],
    icon: 'Files',
    acceptedFormats: ['.pdf'],
    maxFileSize: 100,
    seo: {
      title: 'Merge PDF - Combine PDF Files Online | Free & Private',
      metaDescription: 'Merge multiple PDF files into one online for free. Drag and drop to reorder. No upload needed. 100% private and secure.',
      h1: 'Merge PDF Files - Combine Documents Instantly',
      features: [
        'Drag & drop reordering',
        'Combine unlimited files',
        'Preserve quality',
        'Browser-based processing',
        '100% private & secure',
        'Free forever',
      ],
      useCases: [
        'Combine reports',
        'Merge contracts',
        'Organize documents',
        'Create portfolios',
      ],
      faq: [
        {
          question: 'How do I change the order?',
          answer: 'Simply drag and drop the file thumbnails to arrange them in your desired order before merging.',
        },
        {
          question: 'Is there a file limit?',
          answer: 'You can merge as many files as your device memory allows. We recommend keeping total size under 500MB for best performance.',
        },
        {
          question: 'Is it secure?',
          answer: 'Yes! Your files never leave your device. The merging process runs entire in your local browser.',
        },
      ],
    },
  },
  {
    id: 'pdf-organize',
    name: 'Organize PDF',
    slug: 'pdf-organize',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    description: 'Rearrange, rotate, and delete PDF pages with drag-and-drop',
    longDescription: 'Free online PDF page organizer. Drag and drop to rearrange pages, rotate pages to any angle, and delete unwanted pages. Visual thumbnails make organizing easy. All processing happens in your browser for complete privacy.',
    keywords: ['organize pdf', 'rearrange pdf pages', 'reorder pdf', 'rotate pdf pages', 'delete pdf pages', 'pdf page manager', 'drag drop pdf'],
    icon: 'Layers',
    acceptedFormats: ['.pdf'],
    maxFileSize: 100,
    seo: {
      title: 'Organize PDF Pages - Rearrange, Rotate & Delete | Free Online',
      metaDescription: 'Organize PDF pages online for free. Drag and drop to rearrange, rotate pages, delete unwanted pages. Visual editor with thumbnails. 100% private.',
      h1: 'Organize PDF Pages - Visual Page Editor',
      features: [
        'Drag & drop reordering',
        'Visual page thumbnails',
        'Rotate pages 90°',
        'Delete unwanted pages',
        'Touch-friendly design',
        '100% private & secure',
      ],
      useCases: [
        'Reorder scanned documents',
        'Fix page sequence errors',
        'Remove blank pages',
        'Rotate sideways pages',
      ],
      faq: [
        {
          question: 'How do I rearrange PDF pages?',
          answer: 'Simply drag any page thumbnail and drop it where you want. The pages will automatically reorder. Works with both mouse and touch.',
        },
        {
          question: 'Can I rotate individual pages?',
          answer: 'Yes! Hover over any page and click the rotate button to rotate it 90° clockwise. Repeat to rotate further.',
        },
        {
          question: 'Is there a page limit?',
          answer: 'No strict limit, but larger PDFs may take longer to load thumbnails. We recommend PDFs under 100MB for best performance.',
        },
        {
          question: 'Is my PDF secure?',
          answer: 'Yes! Your PDF is processed entirely in your browser. No data is ever uploaded to any server.',
        },
      ],
    },
  },
  {
    id: 'pdf-unlock',
    name: 'Unlock PDF',
    slug: 'pdf-unlock',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    description: 'Remove password protection from PDF files',
    longDescription: 'Free online PDF password remover. Remove password protection from PDF files to create an unlocked copy. Enter the password once and download a password-free PDF. All processing happens in your browser for complete privacy.',
    keywords: ['unlock pdf', 'remove pdf password', 'pdf password remover', 'decrypt pdf', 'unprotect pdf', 'pdf unlocker', 'open protected pdf'],
    icon: 'Unlock',
    acceptedFormats: ['.pdf'],
    maxFileSize: 100,
    seo: {
      title: 'Unlock PDF - Remove Password Protection | Free Online Tool',
      metaDescription: 'Remove password protection from PDF files online for free. Enter the password and get an unlocked copy. Browser-based, 100% private.',
      h1: 'Unlock PDF - Remove Password Protection',
      features: [
        'Remove password protection',
        'Create unlocked copy',
        'Preserves all content',
        'Browser-based processing',
        '100% private & secure',
        'No file upload needed',
      ],
      useCases: [
        'Remove forgotten passwords',
        'Share documents without password',
        'Archive PDFs without protection',
        'Simplify document access',
      ],
      faq: [
        {
          question: 'Do I need to know the password?',
          answer: 'Yes, you must know the original password to unlock the PDF. This tool cannot crack or bypass passwords - it removes protection after you verify ownership with the correct password.',
        },
        {
          question: 'Is this legal?',
          answer: 'Yes, when used on your own documents or documents you have permission to access. This tool is meant for legitimate use cases like removing passwords from your own files.',
        },
        {
          question: 'Is my password secure?',
          answer: 'Absolutely! Your password is never sent to any server. All processing happens entirely in your browser.',
        },
        {
          question: 'What types of PDF encryption are supported?',
          answer: 'This tool supports standard PDF password encryption (both user and owner passwords). It may not work with some advanced DRM systems.',
        },
      ],
    },
  },
  {
    id: 'pdf-rotate',
    name: 'Rotate PDF',
    slug: 'pdf-rotate',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    description: 'Rotate PDF pages by 90°, 180°, or 270°',
    longDescription: 'Free online PDF rotator. Rotate all pages or select specific pages to rotate. Preview changes before saving. Supports 90°, 180°, and 270° rotation. All processing happens in your browser for complete privacy.',
    keywords: ['rotate pdf', 'pdf rotator', 'turn pdf pages', 'flip pdf', 'rotate pdf online', 'pdf page rotation', 'fix pdf orientation'],
    icon: 'RotateCw',
    acceptedFormats: ['.pdf'],
    maxFileSize: 100,
    seo: {
      title: 'Rotate PDF Pages - 90°, 180°, 270° | Free Online Tool',
      metaDescription: 'Rotate PDF pages online for free. Select pages or rotate all at once. Preview rotation before saving. 100% private browser processing.',
      h1: 'Rotate PDF Pages - Visual Editor',
      features: [
        'Rotate 90°, 180°, or 270°',
        'Visual page previews',
        'Select individual pages',
        'Rotate all at once',
        'Preview before saving',
        '100% private & secure',
      ],
      useCases: [
        'Fix scanned documents',
        'Correct landscape pages',
        'Rotate photos in PDF',
        'Fix upside-down pages',
      ],
      faq: [
        {
          question: 'Can I rotate individual pages?',
          answer: 'Yes! Click on pages to select them, then use the rotation buttons. Or use quick rotate to rotate all pages at once.',
        },
        {
          question: 'What rotation angles are supported?',
          answer: 'You can rotate pages by 90° clockwise, 180° (upside down), or 90° counter-clockwise (270°).',
        },
        {
          question: 'Is the rotation permanent?',
          answer: 'Yes, the rotation is saved permanently in the downloaded PDF. Your original file is never modified.',
        },
        {
          question: 'Is my PDF secure?',
          answer: 'Yes! Your PDF is processed entirely in your browser. No files are uploaded to any server.',
        },
      ],
    },
  },
  {
    id: 'pdf-page-numbers',
    name: 'Add Page Numbers',
    slug: 'pdf-page-numbers',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    description: 'Add page numbers to your PDF documents',
    longDescription: 'Free online tool to add page numbers to PDF files. Choose position, format, and styling. Preview before saving. All processing happens in your browser for complete privacy.',
    keywords: ['add page numbers pdf', 'pdf page numbering', 'number pdf pages', 'pdf pagination', 'insert page numbers'],
    icon: 'Hash',
    acceptedFormats: ['.pdf'],
    maxFileSize: 100,
    seo: {
      title: 'Add Page Numbers to PDF | Free Online Tool',
      metaDescription: 'Add page numbers to PDF files online for free. Choose position, format, and style. Preview before saving. 100% private browser processing.',
      h1: 'Add Page Numbers to PDF',
      features: [
        '6 position options',
        '4 number formats',
        'Custom font size',
        'Adjustable margins',
        'Preview before saving',
        '100% private & secure',
      ],
      useCases: [
        'Number document pages',
        'Prepare for printing',
        'Organize reports',
        'Format manuscripts',
      ],
      faq: [
        {
          question: 'Where can page numbers be placed?',
          answer: 'You can place page numbers in 6 positions: top-left, top-center, top-right, bottom-left, bottom-center, or bottom-right.',
        },
        {
          question: 'What number formats are available?',
          answer: 'Choose from: simple numbers (1, 2, 3), "Page N", "N of Total", or "Page N of Total".',
        },
        {
          question: 'Can I skip certain pages?',
          answer: 'Currently all pages are numbered, but you can set a custom starting number.',
        },
        {
          question: 'Is my PDF secure?',
          answer: 'Yes! Your PDF is processed entirely in your browser. No files are uploaded to any server.',
        },
      ],
    },
  },
  {
    id: 'pdf-metadata',
    name: 'Edit PDF Metadata',
    slug: 'pdf-metadata',
    category: 'pdf',
    categoryLabel: 'PDF Tools',
    description: 'View and edit PDF document metadata',
    longDescription: 'Free online PDF metadata editor. View and edit title, author, subject, keywords, and more. See creation and modification dates. All processing happens in your browser for complete privacy.',
    keywords: ['pdf metadata editor', 'edit pdf properties', 'pdf title author', 'pdf document info', 'change pdf metadata'],
    icon: 'Settings',
    acceptedFormats: ['.pdf'],
    maxFileSize: 100,
    seo: {
      title: 'Edit PDF Metadata - Title, Author, Keywords | Free Online Tool',
      metaDescription: 'Edit PDF metadata online for free. Change title, author, subject, keywords and more. View document dates. 100% private browser processing.',
      h1: 'Edit PDF Metadata & Properties',
      features: [
        'Edit title & author',
        'Set subject & keywords',
        'View creation date',
        'Update producer info',
        'Track changes',
        '100% private & secure',
      ],
      useCases: [
        'Update document info',
        'Add author credits',
        'Organize with keywords',
        'Prepare for publishing',
      ],
      faq: [
        {
          question: 'What metadata can I edit?',
          answer: 'You can edit title, author, subject, keywords, creator application, and PDF producer.',
        },
        {
          question: 'Can I change the creation date?',
          answer: 'No, creation and modification dates are read-only for integrity. The modification date updates automatically when you save.',
        },
        {
          question: 'Will editing metadata affect content?',
          answer: 'No, editing metadata only changes document properties. Your PDF content remains completely unchanged.',
        },
        {
          question: 'Is my PDF secure?',
          answer: 'Yes! Your PDF is processed entirely in your browser. No files are uploaded to any server.',
        },
      ],
    },
  },
  {
    id: 'word-counter',
    name: 'Word Counter',
    slug: 'word-counter',
    category: 'text',
    categoryLabel: 'Text Tools',
    description: 'Count words, characters, sentences, and paragraphs in your text files',
    longDescription: 'Free online word counter tool. Upload any text file to instantly analyze its content. Get detailed statistics including word count, character count, sentence count, reading time, and more. Works locally in your browser.',
    keywords: ['word counter', 'character count', 'text analyzer', 'word count tool', 'count words in file', 'reading time calculator'],
    icon: 'Type',
    acceptedFormats: ['.txt', '.md', '.json', '.xml', '.csv'],
    maxFileSize: 10,
    seo: {
      title: 'Word Counter - Count Words & Characters in Text Files | Free Online',
      metaDescription: 'Free online word counter tool. Upload text files and get instant statistics: words, characters, sentences, paragraphs, and reading time. 100% private and secure.',
      h1: 'Word Counter - Text File Analyzer',
      features: [
        'Instant analysis',
        'Word & character count',
        'Sentence & paragraph count',
        'Reading time estimation',
        'Supports multiple formats',
        '100% Private',
      ],
      useCases: [
        'Checking essay length',
        'Analyzing blog posts',
        'SEO content optimization',
        'Code documentation metrics',
      ],
      faq: [
        {
          question: 'What file formats are supported?',
          answer: 'We support common text formats including .txt, .md (Markdown), .json, .xml, and .csv files.',
        },
        {
          question: 'Is there a file size limit?',
          answer: 'Yes, currently we accept files up to 10MB to ensure fast processing directly in your browser.',
        },
        {
          question: 'Do you store my text?',
          answer: 'No. Your text is processed entirely within your web browser. It is never uploaded to our servers.',
        },
        {
          question: 'How is reading time calculated?',
          answer: 'We estimate reading time based on an average reading speed of 200 words per minute.',
        },
      ],
    },
  },
  {
    id: 'case-converter',
    name: 'Case Converter',
    slug: 'case-converter',
    category: 'text',
    categoryLabel: 'Text Tools',
    description: 'Convert text between different letter cases (UPPER, lower, Title, Camel, etc.)',
    longDescription: 'Free online case converter tool. Instantly convert text between Uppercase, Lowercase, Title Case, Sentence case, PascalCase, camelCase, snake_case, and kebab-case. Works locally in your browser for maximum privacy.',
    keywords: ['case converter', 'text case converter', 'uppercase to lowercase', 'title case generator', 'sentence case', 'camelcase converter', 'snake case', 'kebab case'],
    icon: 'Type',
    acceptedFormats: ['.txt'],
    maxFileSize: 10,
    seo: {
      title: 'Case Converter - Convert Text Case Online | Free & Private',
      metaDescription: 'Convert text case instantly online. Support for Uppercase, Lowercase, Title Case, camelCase, snake_case and more. 100% free and private.',
      h1: 'Case Converter - Transform Text Case',
      features: [
        'Instant conversion',
        'Supports 8+ case styles',
        'Bulk text processing',
        'Copy to clipboard',
        'Download as file',
        '100% Private',
      ],
      useCases: [
        'Fixing accidental caps lock',
        'Programming variable naming',
        'Title formatting for content',
        'Data cleaning',
      ],
      faq: [
        {
          question: 'What case styles are supported?',
          answer: 'We support Uppercase, Lowercase, Title Case, Sentence case, PascalCase, camelCase, snake_case, and kebab-case.',
        },
        {
          question: 'Is there a character limit?',
          answer: 'No strict limit. The tool runs in your browser so it can handle as much text as your computer memory allows.',
        },
        {
          question: 'Do you save my text?',
          answer: 'No. All processing happens locally in your web browser. Your text never leaves your device.',
        },
      ],
    },
  },
  {
    id: 'text-diff',
    name: 'Text Diff/Compare',
    slug: 'text-diff',
    category: 'text',
    categoryLabel: 'Text Tools',
    description: 'Compare two texts side-by-side and highlight differences',
    longDescription: 'Free online text comparison tool. Compare two texts side-by-side with line-by-line diff highlighting. See additions, deletions, and modifications instantly. Perfect for code reviews, document comparison, and content editing.',
    keywords: ['text diff', 'text compare', 'diff tool', 'compare text', 'text difference', 'side by side comparison', 'text comparison tool'],
    icon: 'GitCompare',
    acceptedFormats: [],
    maxFileSize: 10,
    seo: {
      title: 'Text Diff/Compare - Side-by-Side Comparison | Free Online Tool',
      metaDescription: 'Compare two texts online for free. Line-by-line diff with highlighted changes. See additions, deletions, and modifications. 100% private browser processing.',
      h1: 'Text Diff & Comparison Tool',
      features: [
        'Side-by-side comparison',
        'Line-by-line diff view',
        'Highlight additions/deletions',
        'Show modifications',
        'Change statistics',
        '100% private & secure',
      ],
      useCases: [
        'Compare document versions',
        'Review code changes',
        'Check content edits',
        'Verify translations',
      ],
      faq: [
        {
          question: 'How does the comparison work?',
          answer: 'The tool compares texts line-by-line and highlights lines that are added (green), deleted (red), or modified (yellow).',
        },
        {
          question: 'Can I compare code?',
          answer: 'Yes! The monospace font and line numbers make it perfect for comparing code snippets or configuration files.',
        },
        {
          question: 'Is my text data secure?',
          answer: 'Yes! All comparison happens in your browser. Your text is never uploaded to any server.',
        },
      ],
    },
  },

  {
    id: 'find-replace',
    name: 'Find & Replace',
    slug: 'find-replace',
    category: 'text',
    categoryLabel: 'Text Tools',
    description: 'Bulk find and replace text with Regex support',
    longDescription: 'Free online bulk find and replace tool. Search and replace text patterns instantly. Supports regular expressions (Regex), case sensitivity, and whole word matching. Perfect for code refactoring and content editing.',
    keywords: ['find and replace', 'search replace', 'regex replace', 'text replacer', 'bulk replace', 'string substitution'],
    icon: 'Replace',
    acceptedFormats: [],
    maxFileSize: 10,
    seo: {
      title: 'Find & Replace Tool - Bulk Text Replacement | Fre Online',
      metaDescription: 'Bulk find and replace text online for free. Support for Regex, case sensitivity, and whole word matching. Instant results with match statistics. 100% private.',
      h1: 'Bulk Find & Replace Tool with Regex',
      features: [
        'Regular Expression (Regex) support',
        'Case sensitive matching',
        'Whole word matching',
        'Real-time match counting',
        'Instant result preview',
        'One-click copy result',
      ],
      useCases: [
        'Refactor code variables',
        'Update content templates',
        'Clean up data formatting',
        'Complex regex substitutions',
      ],
      faq: [
        {
          question: 'How to use Regular Expressions (Regex)?',
          answer: 'Toggle the "Regular Expression" switch. You can now use standard JavaScript RegEx patterns. For example, use \\d+ to match matching numbers, ^Start to match the start of a line, or \\w+ to match words.',
        },
        {
          question: 'Can I use capturing groups?',
          answer: 'Yes! You can use parentheses () to create capturing groups in the Find field, and reference them in the Replace field using $1, $2, etc. For example, Find: (\\w+)-(\\d+) and Replace: $2-$1 will swap the word and number.',
        },
        {
          question: 'Common Regex Examples',
          answer: '• Remove all numbers: \\d+ • Find emails: [\\w.-]+@[\\w.-]+\\.[a-z]{2,} • Match start of line: ^ • Match end of line: $',
        },
        {
          question: 'Is it case sensitive?',
          answer: 'By default no, but you can enable "Match Case" for strict case sensitivity.',
        },
        {
          question: 'Is my text private?',
          answer: 'Absolutely. All processing happens in your browser. Nothing is ever sent to a server.',
        },
      ],
    },
  },

  {
    id: 'lorem-ipsum',
    name: 'Lorem Ipsum Generator',
    slug: 'lorem-ipsum',
    category: 'text',
    categoryLabel: 'Text Tools',
    description: 'Generate placeholder text for designs and mockups',
    longDescription: 'Free online Lorem Ipsum generator. Create placeholder text for your designs, mockups, and prototypes settings. Generate paragraphs, sentences, or words. Copy to clipboard instantly.',
    keywords: ['lorem ipsum generator', 'placeholder text', 'dummy text', 'text generator', 'lorem ipsum', 'design mockups'],
    icon: 'FileText',
    acceptedFormats: [],
    maxFileSize: 0,
    seo: {
      title: 'Lorem Ipsum Generator - Free Placeholder Text Tool',
      metaDescription: 'Generate Lorem Ipsum dummy text for free. Create paragraphs, sentences, or words for your designs. Instant copy and download.',
      h1: 'Lorem Ipsum Text Generator',
      features: [
        'Generate paragraphs, sentences, or words',
        'Customizable text length',
        'Start with "Lorem ipsum" option',
        'Instant copy to clipboard',
        'Download as text file',
        'No limits',
      ],
      useCases: [
        'Web design mockups',
        'Print layout prototypes',
        'Content placeholders',
        'Typography testing',
      ],
      faq: [
        {
          question: 'What is Lorem Ipsum?',
          answer: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry, used as a placeholder since the 1500s.',
        },
        {
          question: 'Is the text random?',
          answer: 'It is based on a standard Latin text by Cicero, but randomized to look like natural sentence structures.',
        },
        {
          question: 'Can I generate words only?',
          answer: 'Yes! Select the "Words" tab to generate a specific number of random Latin words.',
        },
      ],
    },
  },

  {
    id: 'text-to-slug',
    name: 'Text to Slug',
    slug: 'text-to-slug',
    category: 'text',
    categoryLabel: 'Text Tools',
    description: 'Convert text to SEO-friendly URL slugs',
    longDescription: 'Free online Text to Slug converter. Transform any text into SEO-friendly URL slugs instantly. Normalize characters, remove stop words, and customize separators. Perfect for bloggers, developers, and SEO specialists.',
    keywords: ['text to slug', 'slug generator', 'url slug converter', 'seo friendly url', 'string to slug', 'clean url generator'],
    icon: 'Link',
    acceptedFormats: [],
    maxFileSize: 0,
    seo: {
      title: 'Text to Slug Converter - SEO URL Generator | Free Online',
      metaDescription: 'Convert text to URL slugs online for free. SEO-friendly formatting, custom separators, and stop word removal. Instant preview and copy.',
      h1: 'Text to URL Slug Converter',
      features: [
        'SEO-friendly formatting',
        'Custom separators (- or _)',
        'Remove special characters',
        'Unicode normalization (e.g. é → e)',
        'Optional stop words removal',
        'Instant conversion',
      ],
      useCases: [
        'Blog post URLs',
        'Product page links',
        'File naming conventions',
        'Database keys',
      ],
      faq: [
        {
          question: 'What is a URL slug?',
          answer: 'A slug is the part of a URL that identifies a particular page on a website in a human-readable form.',
        },
        {
          question: 'How does it handle special characters?',
          answer: 'It automatically removes special characters and accents (e.g., converts "Café" to "cafe") for clean, safe URLs.',
        },
        {
          question: 'What stop words are removed?',
          answer: 'Common words like "a", "an", "the", "and", "or", etc., which are often unnecessary for SEO-friendly URLs.',
        },
      ],
    },
  },

  {
    id: 'remove-duplicate-lines',
    name: 'Remove Duplicate Lines',
    slug: 'remove-duplicate-lines',
    category: 'text',
    categoryLabel: 'Text Tools',
    description: 'Remove duplicate lines from text lists',
    longDescription: 'Free online tool to remove duplicate lines from text. Clean up lists, data sets, and logs instantly. Supports case sensitivity and whitespace trimming options. Get unique lines in seconds.',
    keywords: ['remove duplicates', 'duplicate lines remover', 'deduplicate text', 'unique lines', 'remove repeat lines', 'clean text list'],
    icon: 'Layers',
    acceptedFormats: [],
    maxFileSize: 10,
    seo: {
      title: 'Remove Duplicate Lines - Deduplicate Text Online | Free Tool',
      metaDescription: 'Remove duplicate lines from text lists online for free. Clean up data, emails, or logs. Options for case sensitivity and trimming. Instant results.',
      h1: 'Remove Duplicate Lines from Text',
      features: [
        'Instant deduplication',
        'Case sensitive option',
        'Trim whitespace support',
        'Original vs Unique stats',
        'Copy result instantly',
        '100% private',
      ],
      useCases: [
        'Clean email lists',
        'Deduplicate data logs',
        'Filter unique values',
        'Prepare data for Excel/CSV',
      ],
      faq: [
        {
          question: 'Does it remove empty lines?',
          answer: 'Empty lines are treated as valid lines. If you have multiple empty lines, all but one will be removed if they are duplicates.',
        },
        {
          question: 'Is it case sensitive?',
          answer: 'By default, no (A = a). You can enable "Case Sensitive" to treat "Text" and "text" as different lines.',
        },
        {
          question: 'Does it sort the output?',
          answer: 'No, this tool preserves the original order of the first occurrence of each line. Use the "Sort Lines" tool if you need sorting.',
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
