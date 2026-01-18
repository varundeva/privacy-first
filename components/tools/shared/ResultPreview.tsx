'use client';

import { Card } from '@/components/ui/card';
import type { ImageMetadata } from '@/lib/workers/types';
import { FileImage, ArrowRight, HardDrive, Maximize2 } from 'lucide-react';

interface ResultPreviewProps {
  previewUrl: string;
  original: ImageMetadata;
  converted: ImageMetadata;
}

export function ResultPreview({ previewUrl, original, converted }: ResultPreviewProps) {
  const sizeChange = ((converted.sizeBytes - original.sizeBytes) / original.sizeBytes) * 100;
  const isSmaller = sizeChange < 0;

  return (
    <div className="space-y-6">
      {/* Image Preview */}
      <Card className="overflow-hidden p-6">
        <h3 className="mb-4 font-semibold">Preview</h3>
        <div className="flex items-center justify-center rounded-lg bg-muted/50 p-6">
          <img
            src={previewUrl}
            alt="Converted image preview"
            className="max-h-96 w-auto rounded shadow-lg"
          />
        </div>
      </Card>

      {/* Metadata Comparison */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Original */}
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <FileImage className="h-5 w-5 text-blue-500" />
            <h4 className="font-semibold">Original {original.format.toUpperCase()}</h4>
          </div>
          <MetadataList metadata={original} />
        </Card>

        {/* Converted */}
        <Card className="p-6 border-primary/50">
          <div className="mb-4 flex items-center gap-2">
            <FileImage className="h-5 w-5 text-green-500" />
            <h4 className="font-semibold">Converted {converted.format.toUpperCase()}</h4>
          </div>
          <MetadataList metadata={converted} />
        </Card>
      </div>

      {/* Size Comparison */}
      <Card className="bg-muted/30 p-4">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            <span className="font-medium">Size Change:</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{original.size}</span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{converted.size}</span>
          </div>
          <span className={`font-medium ${isSmaller ? 'text-green-600' : 'text-amber-600'}`}>
            ({isSmaller ? '' : '+'}{sizeChange.toFixed(1)}%)
          </span>
        </div>
      </Card>
    </div>
  );
}

function MetadataList({ metadata }: { metadata: ImageMetadata }) {
  const items = [
    { label: 'Format', value: metadata.format.toUpperCase() },
    { label: 'File Name', value: metadata.name, truncate: true },
    { label: 'Size', value: metadata.size },
    { label: 'Dimensions', value: `${metadata.width}×${metadata.height}px` },
  ];

  return (
    <div className="space-y-3 text-sm">
      {items.map((item, index) => (
        <div key={item.label} className={`flex justify-between ${index < items.length - 1 ? 'border-b pb-2' : ''}`}>
          <span className="text-muted-foreground">{item.label}:</span>
          <span className={`font-medium ${item.truncate ? 'truncate max-w-[150px]' : ''}`}>
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
