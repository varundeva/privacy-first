'use client';

import { ToolShell } from '@/components/tools/ToolShell';
import { RelatedTools } from '@/components/tools/RelatedTools';
import { getCategoryLabel } from '@/lib/tools-config';

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
import { WordCounter, CaseConverter, TextDiff, FindAndReplace, LoremIpsumGenerator, TextToSlug, RemoveDuplicateLines } from '@/components/tools/text';

// Import Date tools
import { UnixTimestampConverter, TimeDifferenceCalculator, TimeZoneConverter, DateFormatConverter, WeekNumberCalculator, AgeCalculator, BusinessDaysCalculator } from '@/components/tools/date';
import { JsonFormatter, JsonToCsv, CsvToJson, JsonToTypescript, JsonToYaml, YamlToJson } from '@/components/tools/json';
import { Md5Generator, ShaGenerator, BcryptGenerator, AesEncryption, Base64Encoder, JwtDebugger } from '@/components/tools/crypto';
import { SqlFormatter, HtmlFormatter, CssFormatter, UrlEncoder, UrlParser, UserAgentParser, HtmlEntityConverter, ColorConverter, CssUnitConverter } from '@/components/tools/web';

interface ToolPageClientProps {
  toolId: string;
  title: string;
  description: string;
  acceptedFormats: string[];
  maxFileSize: number;
  features?: string[];
  useCases?: string[];
  faq?: { question: string; answer: string }[];
  category: string;
}

export function ToolPageClient({
  toolId,
  title,
  description,
  acceptedFormats,
  maxFileSize,
  features,
  useCases,
  faq,
  category,
}: ToolPageClientProps) {
  const categoryLabel = getCategoryLabel(category as any);

  // Render logic for special tools (+ internal linking)
  const renderSpecialTool = () => {
    switch (toolId) {
      case 'word-counter':
        return <WordCounter title={title} description={description} acceptedFormats={acceptedFormats} maxFileSize={maxFileSize} features={features} useCases={useCases} faq={faq} />;
      case 'case-converter':
        return <CaseConverter title={title} description={description} acceptedFormats={acceptedFormats} maxFileSize={maxFileSize} features={features} useCases={useCases} faq={faq} />;
      case 'base64-to-image':
        return <Base64ToImage title={title} description={description} features={features} useCases={useCases} faq={faq} />;
      case 'text-diff':
        return <TextDiff title={title} description={description} features={features} useCases={useCases} faq={faq} />;
      case 'find-replace':
        return <FindAndReplace title={title} description={description} features={features} useCases={useCases} faq={faq} />;
      case 'lorem-ipsum':
        return <LoremIpsumGenerator title={title} description={description} features={features} useCases={useCases} faq={faq} />;
      case 'text-to-slug':
        return <TextToSlug title={title} description={description} features={features} useCases={useCases} faq={faq} />;
      case 'remove-duplicate-lines':
        return <RemoveDuplicateLines title={title} description={description} features={features} useCases={useCases} faq={faq} />;
      case 'unix-timestamp':
        return <UnixTimestampConverter title={title} description={description} features={features} useCases={useCases} faq={faq} />;
      case 'time-difference':
        return <TimeDifferenceCalculator title={title} description={description} features={features} useCases={useCases} faq={faq} />;
      case 'time-zone-converter':
        return <TimeZoneConverter title={title} description={description} features={features} useCases={useCases} faq={faq} />;
      case 'date-format-converter':
        return <DateFormatConverter title={title} description={description} features={features} useCases={useCases} faq={faq} />;
      case 'week-number-calculator':
        return <WeekNumberCalculator title={title} description={description} features={features} useCases={useCases} faq={faq} />;
      case 'age-calculator':
        return <AgeCalculator title={title} description={description} features={features} useCases={useCases} faq={faq} />;
      case 'business-days-calculator':
        return <BusinessDaysCalculator title={title} description={description} features={features} useCases={useCases} faq={faq} />;
      case 'json-formatter':
        return <JsonFormatter title={title} description={description} features={features} useCases={useCases} faq={faq} />;
      case 'json-to-csv':
        return <JsonToCsv title={title} description={description} features={features} useCases={useCases} faq={faq} />;
      case 'csv-to-json':
        return <CsvToJson title={title} description={description} features={features} useCases={useCases} faq={faq} />;
      case 'json-to-typescript':
        return <JsonToTypescript title={title} description={description} features={features} useCases={useCases} faq={faq} />;
      case 'json-to-yaml':
        return <JsonToYaml title={title} description={description} features={features} useCases={useCases} faq={faq} />;
      case 'yaml-to-json':
        return <YamlToJson title={title} description={description} features={features} useCases={useCases} faq={faq} />;
      case 'md5-generator':
        return <Md5Generator title={title} description={description} features={features} useCases={useCases} faq={faq} />;
      case 'sha-generator':
        return <ShaGenerator title={title} description={description} features={features} useCases={useCases} faq={faq} />;
      case 'bcrypt-generator':
        return <BcryptGenerator title={title} description={description} features={features} useCases={useCases} faq={faq} />;
      case 'aes-encryption':
        return <AesEncryption title={title} description={description} features={features} useCases={useCases} faq={faq} />;
      case 'base64-encoder':
        return <Base64Encoder title={title} description={description} features={features} useCases={useCases} faq={faq} />;
      case 'sql-formatter':
        return <SqlFormatter title={title} description={description} features={features} useCases={useCases} faq={faq} />;
      case 'html-formatter':
        return <HtmlFormatter title={title} description={description} features={features} useCases={useCases} faq={faq} />;
      case 'css-formatter':
        return <CssFormatter title={title} description={description} features={features} useCases={useCases} faq={faq} />;
      case 'url-encoder':
        return <UrlEncoder title={title} description={description} features={features} useCases={useCases} faq={faq} />;
      case 'url-parser':
        return <UrlParser title={title} description={description} features={features} useCases={useCases} faq={faq} />;
      case 'user-agent-parser':
        return <UserAgentParser title={title} description={description} features={features} useCases={useCases} faq={faq} />;
      case 'html-entity-converter':
        return <HtmlEntityConverter title={title} description={description} features={features} useCases={useCases} faq={faq} />;
      case 'color-converter':
        return <ColorConverter title={title} description={description} features={features} useCases={useCases} faq={faq} />;
      case 'css-unit-converter':
        return <CssUnitConverter title={title} description={description} features={features} useCases={useCases} faq={faq} />;
      case 'jwt-debugger':
        return <JwtDebugger title={title} description={description} features={features} useCases={useCases} faq={faq} />;
      default:
        return null;
    }
  };

  const specialTool = renderSpecialTool();

  let toolContent;
  if (specialTool) {
    toolContent = specialTool;
  } else {
    toolContent = (
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
            case 'jpg-to-png': return <JpgToPngConverter file={file} onReset={onReset} />;
            case 'jpg-to-webp': return <JpgToWebpConverter file={file} onReset={onReset} />;
            case 'png-to-jpg': return <PngToJpgConverter file={file} onReset={onReset} />;
            case 'png-to-webp': return <PngToWebpConverter file={file} onReset={onReset} />;
            case 'webp-to-png': return <WebpToPngConverter file={file} onReset={onReset} />;
            case 'webp-to-jpg': return <WebpToJpgConverter file={file} onReset={onReset} />;
            case 'gif-to-png': return <GifToPngConverter file={file} onReset={onReset} />;
            case 'gif-to-jpg': return <GifToJpgConverter file={file} onReset={onReset} />;
            case 'gif-to-webp': return <GifToWebpConverter file={file} onReset={onReset} />;
            case 'bmp-to-png': return <BmpToPngConverter file={file} onReset={onReset} />;
            case 'bmp-to-jpg': return <BmpToJpgConverter file={file} onReset={onReset} />;
            case 'bmp-to-webp': return <BmpToWebpConverter file={file} onReset={onReset} />;
            case 'svg-to-png': return <SvgToPngConverter file={file} onReset={onReset} />;
            case 'svg-to-jpg': return <SvgToJpgConverter file={file} onReset={onReset} />;
            case 'svg-to-webp': return <SvgToWebpConverter file={file} onReset={onReset} />;
            case 'ico-to-png': return <IcoToPngConverter file={file} onReset={onReset} />;
            case 'image-metadata': return <ImageMetadataViewer file={file} onReset={onReset} />;
            case 'image-to-base64': return <ImageToBase64 file={file} onReset={onReset} />;
            case 'pdf-to-png': return <PdfToPngConverter file={file} onReset={onReset} />;
            case 'pdf-to-jpg': return <PdfToJpgConverter file={file} onReset={onReset} />;
            case 'pdf-compress': return <PdfCompressor file={file} onReset={onReset} />;
            case 'pdf-split': return <PdfSplitter file={file} onReset={onReset} />;
            case 'pdf-merge': return <PdfMerger file={file} onReset={onReset} />;
            case 'pdf-organize': return <PdfOrganizer file={file} onReset={onReset} />;
            case 'pdf-unlock': return <PdfUnlocker file={file} onReset={onReset} />;
            case 'pdf-rotate': return <PdfRotator file={file} onReset={onReset} />;
            case 'pdf-page-numbers': return <PdfPageNumbers file={file} onReset={onReset} />;
            case 'pdf-metadata': return <PdfMetadataEditor file={file} onReset={onReset} />;
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

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        {toolContent}
      </div>
      <div className="mx-auto max-w-4xl px-4 pb-24 sm:px-6 w-full">
        <RelatedTools
          categoryId={category}
          currentToolId={toolId}
          categoryLabel={categoryLabel}
        />
      </div>
    </div>
  );
}
