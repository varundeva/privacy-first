'use client';

import { ToolShell } from '@/components/tools/ToolShell';

// Import all image converters
import { 
  JpgToPngConverter,
  JpgToWebpConverter,
  PngToJpgConverter,
  PngToWebpConverter,
  WebpToPngConverter,
  WebpToJpgConverter,
  BmpToPngConverter,
  GifToPngConverter,
} from '@/components/tools/image';

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
 * To add a new tool:
 * 1. Create the tool component in /components/tools/[category]/
 * 2. Import it above
 * 3. Add a case in the switch statement below
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
          // JPG/JPEG Converters
          case 'jpg-to-png':
            return <JpgToPngConverter file={file} onReset={onReset} />;
          case 'jpg-to-webp':
            return <JpgToWebpConverter file={file} onReset={onReset} />;
          
          // PNG Converters
          case 'png-to-jpg':
            return <PngToJpgConverter file={file} onReset={onReset} />;
          case 'png-to-webp':
            return <PngToWebpConverter file={file} onReset={onReset} />;
          
          // WebP Converters
          case 'webp-to-png':
            return <WebpToPngConverter file={file} onReset={onReset} />;
          case 'webp-to-jpg':
            return <WebpToJpgConverter file={file} onReset={onReset} />;
          
          // Other Format Converters
          case 'bmp-to-png':
            return <BmpToPngConverter file={file} onReset={onReset} />;
          case 'gif-to-png':
            return <GifToPngConverter file={file} onReset={onReset} />;
          
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
