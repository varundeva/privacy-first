'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { DownloadCard } from '../DownloadCard';
import { ProcessingStatus } from '../shared/ProcessingStatus';
import { ResultPreview } from '../shared/ResultPreview';
import { convertImage, type ProgressUpdate, type ImageConversionResult } from '@/lib/workers/worker-manager';
import { formatFileSize, type ImageMetadata } from '@/lib/workers/types';

interface SvgToWebpConverterProps {
  file: File;
  onReset: () => void;
}

type ConversionState = 
  | { status: 'idle' }
  | { status: 'processing'; progress: ProgressUpdate }
  | { status: 'complete'; result: ImageConversionResult; previewUrl: string }
  | { status: 'error'; message: string };

/**
 * SVG to WebP Converter
 * 
 * Rasterizes vector SVG graphics to modern WebP format.
 * Creates optimized web-ready images from vector files.
 * Best choice for web performance with quality output.
 */
export function SvgToWebpConverter({ file, onReset }: SvgToWebpConverterProps) {
  const [state, setState] = useState<ConversionState>({ status: 'idle' });

  useEffect(() => {
    return () => {
      if (state.status === 'complete') {
        URL.revokeObjectURL(state.previewUrl);
      }
    };
  }, [state]);

  useEffect(() => {
    if (!file) return;

    let cancelled = false;
    let previewUrl: string | null = null;

    const processFile = async () => {
      try {
        setState({
          status: 'processing',
          progress: { percent: 0, stage: 'loading', message: 'Loading SVG image...' },
        });

        const result = await convertImage(file, 'webp', {
          quality: 0.9,
          onProgress: (progress) => {
            if (!cancelled) {
              setState({ status: 'processing', progress });
            }
          },
        });

        if (cancelled) return;

        if (result.success && result.data) {
          const blob = new Blob([result.data], { type: 'image/webp' });
          previewUrl = URL.createObjectURL(blob);

          setState({
            status: 'complete',
            result,
            previewUrl,
          });
        } else {
          setState({
            status: 'error',
            message: result.error || 'Failed to convert SVG to WebP',
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            status: 'error',
            message: error instanceof Error ? error.message : 'An unexpected error occurred',
          });
        }
      }
    };

    processFile();

    return () => {
      cancelled = true;
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [file]);

  const handleRetry = useCallback(() => {
    onReset();
  }, [onReset]);

  if (state.status === 'idle') {
    return null;
  }

  if (state.status === 'error') {
    return (
      <Card className="border-destructive bg-destructive/5 p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <p className="font-semibold text-destructive">Conversion Failed</p>
            <p className="text-sm text-muted-foreground">{state.message}</p>
          </div>
        </div>
        <Button variant="outline" className="mt-4 gap-2" onClick={handleRetry}>
          <RotateCcw className="h-4 w-4" />
          Try Again
        </Button>
      </Card>
    );
  }

  if (state.status === 'processing') {
    return <ProcessingStatus progress={state.progress} fileName={file.name} />;
  }

  const { result, previewUrl } = state;

  const originalMetadata: ImageMetadata = {
    name: file.name,
    size: formatFileSize(result.originalSize),
    sizeBytes: result.originalSize,
    width: result.width || 0,
    height: result.height || 0,
    format: 'SVG',
  };

  const convertedMetadata: ImageMetadata = {
    name: result.fileName || 'converted.webp',
    size: formatFileSize(result.convertedSize || 0),
    sizeBytes: result.convertedSize || 0,
    width: result.width || 0,
    height: result.height || 0,
    format: 'WebP',
  };

  return (
    <div className="space-y-6">
      <ResultPreview
        previewUrl={previewUrl}
        original={originalMetadata}
        converted={convertedMetadata}
      />

      <DownloadCard
        fileName={convertedMetadata.name}
        fileSize={convertedMetadata.size}
        fileUrl={previewUrl}
        mimeType="image/webp"
      />

      <Button variant="ghost" className="w-full gap-2" onClick={onReset}>
        <RotateCcw className="h-4 w-4" />
        Convert Another SVG to WebP
      </Button>
    </div>
  );
}
