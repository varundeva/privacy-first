'use client';

import { ToolShell } from '@/components/tools/ToolShell';

// Import all image converters
import { 
  // JPG/JPEG Converters
  JpgToPngConverter,
  JpgToWebpConverter,
  
  // PNG Converters
  PngToJpgConverter,
  PngToWebpConverter,
  
  // WebP Converters
  WebpToPngConverter,
  WebpToJpgConverter,
  
  // GIF Converters
  GifToPngConverter,
  GifToJpgConverter,
  GifToWebpConverter,
  
  // BMP Converters
  BmpToPngConverter,
  BmpToJpgConverter,
  BmpToWebpConverter,
  
  // SVG Converters (Rasterize)
  SvgToPngConverter,
  SvgToJpgConverter,
  SvgToWebpConverter,
  
  // ICO Converter
  IcoToPngConverter,
} from '@/components/tools/image';

// Import PDF tools
import { PdfToPngConverter, PdfToJpgConverter } from '@/components/tools/pdf';

interface ToolPageClientProps {
  toolId: string;
  title: string;
  description: string;
  acceptedFormats: string[];
  maxFileSize: number;
}

/**
 * Tool Page Client Component
 * 
 * Maps tool IDs to their respective standalone components.
 * Each tool component is completely self-contained with its own logic.
 * 
 * Total: 16 image converters + 2 PDF tools = 18 tools
 */
export function ToolPageClient({
  toolId,
  title,
  description,
  acceptedFormats,
  maxFileSize,
}: ToolPageClientProps) {
  return (
    <ToolShell
      title={title}
      description={description}
      acceptedFormats={acceptedFormats}
      maxFileSize={maxFileSize}
    >
      {({ file, onReset }) => {
        switch (toolId) {
          // ─────────────────────────────────────────
          // JPG/JPEG Converters
          // ─────────────────────────────────────────
          case 'jpg-to-png':
            return <JpgToPngConverter file={file} onReset={onReset} />;
          case 'jpg-to-webp':
            return <JpgToWebpConverter file={file} onReset={onReset} />;
          
          // ─────────────────────────────────────────
          // PNG Converters
          // ─────────────────────────────────────────
          case 'png-to-jpg':
            return <PngToJpgConverter file={file} onReset={onReset} />;
          case 'png-to-webp':
            return <PngToWebpConverter file={file} onReset={onReset} />;
          
          // ─────────────────────────────────────────
          // WebP Converters
          // ─────────────────────────────────────────
          case 'webp-to-png':
            return <WebpToPngConverter file={file} onReset={onReset} />;
          case 'webp-to-jpg':
            return <WebpToJpgConverter file={file} onReset={onReset} />;
          
          // ─────────────────────────────────────────
          // GIF Converters
          // ─────────────────────────────────────────
          case 'gif-to-png':
            return <GifToPngConverter file={file} onReset={onReset} />;
          case 'gif-to-jpg':
            return <GifToJpgConverter file={file} onReset={onReset} />;
          case 'gif-to-webp':
            return <GifToWebpConverter file={file} onReset={onReset} />;
          
          // ─────────────────────────────────────────
          // BMP Converters
          // ─────────────────────────────────────────
          case 'bmp-to-png':
            return <BmpToPngConverter file={file} onReset={onReset} />;
          case 'bmp-to-jpg':
            return <BmpToJpgConverter file={file} onReset={onReset} />;
          case 'bmp-to-webp':
            return <BmpToWebpConverter file={file} onReset={onReset} />;
          
          // ─────────────────────────────────────────
          // SVG Converters (Rasterize)
          // ─────────────────────────────────────────
          case 'svg-to-png':
            return <SvgToPngConverter file={file} onReset={onReset} />;
          case 'svg-to-jpg':
            return <SvgToJpgConverter file={file} onReset={onReset} />;
          case 'svg-to-webp':
            return <SvgToWebpConverter file={file} onReset={onReset} />;
          
          // ─────────────────────────────────────────
          // ICO Converter
          // ─────────────────────────────────────────
          case 'ico-to-png':
            return <IcoToPngConverter file={file} onReset={onReset} />;
          
          // ─────────────────────────────────────────
          // PDF Tools
          // ─────────────────────────────────────────
          case 'pdf-to-png':
            return <PdfToPngConverter file={file} onReset={onReset} />;
          case 'pdf-to-jpg':
            return <PdfToJpgConverter file={file} onReset={onReset} />;
          
          default:
            return (
              <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                <p className="font-medium">Tool component not found</p>
                <p className="mt-2 text-sm">Tool ID: {toolId}</p>
              </div>
            );
        }
      }}
    </ToolShell>
  );
}

