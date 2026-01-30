'use client';

import { ToolShell } from '@/components/tools/ToolShell';
import { RelatedTools } from '@/components/tools/RelatedTools';

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
  categoryLabel: string;
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
  categoryLabel,
}: ToolPageClientProps) {

  // Render logic for special tools (+ internal linking)
  const renderSpecialTool = () => {
    const commonProps = {
      title,
      description,
      features,
      useCases,
      faq,
      category,
      categoryLabel,
    };

    switch (toolId) {
      case 'word-counter':
        return <WordCounter {...commonProps} acceptedFormats={acceptedFormats} maxFileSize={maxFileSize} />;
      case 'case-converter':
        return <CaseConverter {...commonProps} acceptedFormats={acceptedFormats} maxFileSize={maxFileSize} />;
      case 'base64-to-image':
        return <Base64ToImage {...commonProps} />;
      case 'text-diff':
        return <TextDiff {...commonProps} />;
      case 'find-replace':
        return <FindAndReplace {...commonProps} />;
      case 'lorem-ipsum':
        return <LoremIpsumGenerator {...commonProps} />;
      case 'text-to-slug':
        return <TextToSlug {...commonProps} />;
      case 'remove-duplicate-lines':
        return <RemoveDuplicateLines {...commonProps} />;
      case 'unix-timestamp':
        return <UnixTimestampConverter {...commonProps} />;
      case 'time-difference':
        return <TimeDifferenceCalculator {...commonProps} />;
      case 'time-zone-converter':
        return <TimeZoneConverter {...commonProps} />;
      case 'date-format-converter':
        return <DateFormatConverter {...commonProps} />;
      case 'week-number-calculator':
        return <WeekNumberCalculator {...commonProps} />;
      case 'age-calculator':
        return <AgeCalculator {...commonProps} />;
      case 'business-days-calculator':
        return <BusinessDaysCalculator {...commonProps} />;
      case 'json-formatter':
        return <JsonFormatter {...commonProps} />;
      case 'json-to-csv':
        return <JsonToCsv {...commonProps} />;
      case 'csv-to-json':
        return <CsvToJson {...commonProps} />;
      case 'json-to-typescript':
        return <JsonToTypescript {...commonProps} />;
      case 'json-to-yaml':
        return <JsonToYaml {...commonProps} />;
      case 'yaml-to-json':
        return <YamlToJson {...commonProps} />;
      case 'md5-generator':
        return <Md5Generator {...commonProps} />;
      case 'sha-generator':
        return <ShaGenerator {...commonProps} />;
      case 'bcrypt-generator':
        return <BcryptGenerator {...commonProps} />;
      case 'aes-encryption':
        return <AesEncryption {...commonProps} />;
      case 'base64-encoder':
        return <Base64Encoder {...commonProps} />;
      case 'sql-formatter':
        return <SqlFormatter {...commonProps} />;
      case 'html-formatter':
        return <HtmlFormatter {...commonProps} />;
      case 'css-formatter':
        return <CssFormatter {...commonProps} />;
      case 'url-encoder':
        return <UrlEncoder {...commonProps} />;
      case 'url-parser':
        return <UrlParser {...commonProps} />;
      case 'user-agent-parser':
        return <UserAgentParser {...commonProps} />;
      case 'html-entity-converter':
        return <HtmlEntityConverter {...commonProps} />;
      case 'color-converter':
        return <ColorConverter {...commonProps} />;
      case 'css-unit-converter':
        return <CssUnitConverter {...commonProps} />;
      case 'jwt-debugger':
        return <JwtDebugger {...commonProps} />;
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
        category={category}
        categoryLabel={categoryLabel}
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
