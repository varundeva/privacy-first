'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  RotateCcw, 
  Download, 
  FileImage,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react';
import { ProcessingStatus } from '../shared/ProcessingStatus';
import { 
  convertPdfToImages, 
} from '@/lib/workers/pdf-utils';
import { formatFileSize, type ProgressUpdate, type PdfPageImage } from '@/lib/workers/types';

interface PdfToJpgConverterProps {
  file: File;
  onReset: () => void;
}

type ConversionState = 
  | { status: 'idle' }
  | { status: 'processing'; progress: ProgressUpdate }
  | { status: 'complete'; pages: PdfPageImage[]; totalPages: number }
  | { status: 'error'; message: string };

/**
 * PDF to JPG Converter
 * 
 * Converts PDF document pages to JPG images with adjustable quality.
 * Perfect for smaller file sizes and web sharing.
 * All processing happens in the browser for maximum privacy.
 */
export function PdfToJpgConverter({ file, onReset }: PdfToJpgConverterProps) {
  const [state, setState] = useState<ConversionState>({ status: 'idle' });
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [scale] = useState(2); // Default 2x scale (144 DPI)

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  // Process PDF when file changes
  useEffect(() => {
    if (!file) return;

    let cancelled = false;

    const processFile = async () => {
      try {
        setState({
          status: 'processing',
          progress: { percent: 0, stage: 'loading', message: 'Loading PDF...' },
        });

        const result = await convertPdfToImages(file, {
          outputFormat: 'jpeg', // JPG output
          quality: 0.92,
          scale,
          onProgress: (progress) => {
            if (!cancelled) {
              setState({ status: 'processing', progress });
            }
          },
        });

        if (cancelled) return;

        if (result.success && result.pages) {
          // Create preview URLs
          const urls = result.pages.map(page => {
            const blob = new Blob([page.data], { type: 'image/jpeg' });
            return URL.createObjectURL(blob);
          });
          
          setPreviewUrls(urls);
          setState({
            status: 'complete',
            pages: result.pages,
            totalPages: result.totalPages || result.pages.length,
          });
        } else {
          setState({
            status: 'error',
            message: result.error || 'Failed to convert PDF to JPG',
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
    };
  }, [file, scale]);

  const handleRetry = useCallback(() => {
    onReset();
  }, [onReset]);

  const handleDownloadPage = useCallback((pageIndex: number) => {
    if (state.status !== 'complete') return;
    
    const page = state.pages[pageIndex];
    const blob = new Blob([page.data], { type: 'image/jpeg' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = page.fileName;
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  const handleDownloadAll = useCallback(async () => {
    if (state.status !== 'complete') return;
    
    // Download each page
    for (let i = 0; i < state.pages.length; i++) {
      const page = state.pages[i];
      const blob = new Blob([page.data], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = page.fileName;
      a.click();
      URL.revokeObjectURL(url);
      
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }, [state]);

  // Idle state - waiting for processing
  if (state.status === 'idle') {
    return null;
  }

  // Error state
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

  // Processing state
  if (state.status === 'processing') {
    return <ProcessingStatus progress={state.progress} fileName={file.name} />;
  }

  // Complete state - show results
  const { pages, totalPages } = state;
  const currentPageData = pages[currentPage];
  const totalSize = pages.reduce((sum, p) => sum + p.data.byteLength, 0);

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
            <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Conversion Complete!</h3>
            <p className="text-sm text-muted-foreground">
              {pages.length} page{pages.length > 1 ? 's' : ''} converted to JPG
            </p>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>Original: {formatFileSize(file.size)}</p>
            <p>Total JPG: {formatFileSize(totalSize)}</p>
          </div>
        </div>
      </Card>

      {/* Preview Section */}
      <Card className="overflow-hidden">
        {/* Preview Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <FileImage className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">
              Page {currentPage + 1} of {pages.length}
            </span>
          </div>
          
          {/* Page Navigation */}
          {pages.length > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(p => Math.min(pages.length - 1, p + 1))}
                disabled={currentPage === pages.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Image Preview */}
        <div className="relative bg-muted/30 p-4">
          <div className="mx-auto max-w-2xl">
            {previewUrls[currentPage] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrls[currentPage]}
                alt={`Page ${currentPage + 1}`}
                className="w-full rounded-lg border shadow-lg"
              />
            )}
          </div>
        </div>

        {/* Page Info */}
        <div className="flex items-center justify-between border-t p-4 text-sm">
          <div className="text-muted-foreground">
            {currentPageData.width} × {currentPageData.height} px
            <span className="mx-2">•</span>
            {formatFileSize(currentPageData.data.byteLength)}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => handleDownloadPage(currentPage)}
          >
            <Download className="h-4 w-4" />
            Download This Page
          </Button>
        </div>
      </Card>

      {/* Page Thumbnails (for multi-page PDFs) */}
      {pages.length > 1 && (
        <Card className="p-4">
          <h4 className="font-medium mb-3">All Pages</h4>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {previewUrls.map((url, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                  currentPage === index 
                    ? 'border-amber-500 ring-2 ring-amber-500/20' 
                    : 'border-transparent hover:border-muted-foreground/30'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Page ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs py-0.5 text-center">
                  {index + 1}
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Download All Button */}
      <div className="flex flex-col sm:flex-row gap-3">
        {pages.length > 1 && (
          <Button 
            className="flex-1 gap-2 bg-amber-600 hover:bg-amber-700"
            onClick={handleDownloadAll}
          >
            <Download className="h-4 w-4" />
            Download All Pages ({pages.length} JPG files)
          </Button>
        )}
        <Button variant="ghost" className="gap-2" onClick={onReset}>
          <RotateCcw className="h-4 w-4" />
          Convert Another PDF
        </Button>
      </div>
    </div>
  );
}
