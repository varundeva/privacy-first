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

  // Image Utilities
  ImageMetadataViewer,
  ImageToBase64,
  Base64ToImage,
} from '@/components/tools/image';

// Import PDF tools
import { PdfToPngConverter, PdfToJpgConverter, PdfCompressor, PdfSplitter, PdfMerger, PdfOrganizer, PdfUnlocker, PdfRotator, PdfPageNumbers, PdfMetadataEditor } from '@/components/tools/pdf';

// Import Text tools
import { WordCounter, CaseConverter, TextDiff, FindAndReplace, LoremIpsumGenerator } from '@/components/tools/text';

interface ToolPageClientProps {
  toolId: string;
  title: string;
  description: string;
  acceptedFormats: string[];
  maxFileSize: number;
  features?: string[];
  useCases?: string[];
  faq?: { question: string; answer: string }[];
}

/**
 * Tool Page Client Component
 * 
 * Maps tool IDs to their respective standalone components.
 * Each tool component is completely self-contained with its own logic.
 * 
 * Total: 16 image converters + 5 PDF tools + 2 Text tools = 23 tools
 */
export function ToolPageClient({
  toolId,
  title,
  description,
  acceptedFormats,
  maxFileSize,
  features,
  useCases,
  faq,
}: ToolPageClientProps) {
  // Special case for Word Counter which manages its own state and layout (file/text input tabs)
  if (toolId === 'word-counter') {
    return (
      <WordCounter
        title={title}
        description={description}
        acceptedFormats={acceptedFormats}
        maxFileSize={maxFileSize}
        features={features}
        useCases={useCases}
        faq={faq}
      />
    );
  }

  // Special case for Case Converter which manages its own text-focused interface
  if (toolId === 'case-converter') {
    return (
      <CaseConverter
        title={title}
        description={description}
        acceptedFormats={acceptedFormats}
        maxFileSize={maxFileSize}
        features={features}
        useCases={useCases}
        faq={faq}
      />
    );
  }

  // Special case for Base64 to Image which takes text input instead of file
  if (toolId === 'base64-to-image') {
    return (
      <Base64ToImage
        title={title}
        description={description}
        features={features}
        useCases={useCases}
        faq={faq}
      />
    );
  }

  // Special case for Text Diff
  if (toolId === 'text-diff') {
    return (
      <TextDiff
        title={title}
        description={description}
        features={features}
        useCases={useCases}
        faq={faq}
      />
    );
  }

  // Special case for Find & Replace
  if (toolId === 'find-replace') {
    return (
      <FindAndReplace
        title={title}
        description={description}
        features={features}
        useCases={useCases}
        faq={faq}
      />
    );
  }

  // Special case for Lorem Ipsum Generator
  if (toolId === 'lorem-ipsum') {
    return (
      <LoremIpsumGenerator
        title={title}
        description={description}
        features={features}
        useCases={useCases}
        faq={faq}
      />
    );
  }

  return (
    <ToolShell
      title={title}
      description={description}
      acceptedFormats={acceptedFormats}
      maxFileSize={maxFileSize}
      features={features}
      useCases={useCases}
      faq={faq}
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
          // Image Utilities
          // ─────────────────────────────────────────
          case 'image-metadata':
            return <ImageMetadataViewer file={file} onReset={onReset} />;
          case 'image-to-base64':
            return <ImageToBase64 file={file} onReset={onReset} />;

          // ─────────────────────────────────────────
          // PDF Tools
          // ─────────────────────────────────────────
          case 'pdf-to-png':
            return <PdfToPngConverter file={file} onReset={onReset} />;
          case 'pdf-to-jpg':
            return <PdfToJpgConverter file={file} onReset={onReset} />;
          case 'pdf-compress':
            return <PdfCompressor file={file} onReset={onReset} />;
          case 'pdf-split':
            return <PdfSplitter file={file} onReset={onReset} />;
          case 'pdf-merge':
            return <PdfMerger file={file} onReset={onReset} />;
          case 'pdf-organize':
            return <PdfOrganizer file={file} onReset={onReset} />;
          case 'pdf-unlock':
            return <PdfUnlocker file={file} onReset={onReset} />;
          case 'pdf-rotate':
            return <PdfRotator file={file} onReset={onReset} />;
          case 'pdf-page-numbers':
            return <PdfPageNumbers file={file} onReset={onReset} />;
          case 'pdf-metadata':
            return <PdfMetadataEditor file={file} onReset={onReset} />;

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

