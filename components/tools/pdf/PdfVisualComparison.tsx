'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { convertPdfToImages } from '@/lib/workers/pdf-utils';
import { formatFileSize } from '@/lib/workers/types';
import { ArrowRight, ZoomIn } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';

interface PdfVisualComparisonProps {
  originalFile: File;
  compressedFile: Blob;
  originalSize: number;
  compressedSize: number;
}

export function PdfVisualComparison({ 
  originalFile, 
  compressedFile,
  originalSize,
  compressedSize 
}: PdfVisualComparisonProps) {
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [compressedPreview, setCompressedPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadPreviews = async () => {
      setLoading(true);
      try {
        // Process original (Page 1 only)
        const originalResult = await convertPdfToImages(originalFile, {
            pageRange: { start: 1, end: 1 },
            scale: 1.5, // Reasonable quality for preview
            outputFormat: 'png'
        });

        if (cancelled) return;

        // Process compressed (Page 1 only)
        // Need to convert Blob to File-like object for utils
        const compressedAsFile = new File([compressedFile], "compressed.pdf", { type: 'application/pdf' });
        const compressedResult = await convertPdfToImages(compressedAsFile, {
            pageRange: { start: 1, end: 1 },
            scale: 1.5,
            outputFormat: 'png'
        });

        if (cancelled) return;

        if (originalResult.success && originalResult.pages && originalResult.pages.length > 0) {
            const blob = new Blob([originalResult.pages[0].data], { type: 'image/png' });
            setOriginalPreview(URL.createObjectURL(blob));
        }

        if (compressedResult.success && compressedResult.pages && compressedResult.pages.length > 0) {
            const blob = new Blob([compressedResult.pages[0].data], { type: 'image/png' });
            setCompressedPreview(URL.createObjectURL(blob));
        }

      } catch (error) {
        console.error("Failed to generate previews", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPreviews();

    return () => {
      cancelled = true;
      if (originalPreview) URL.revokeObjectURL(originalPreview);
      if (compressedPreview) URL.revokeObjectURL(compressedPreview);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalFile, compressedFile]);

  if (loading) {
    return (
      <Card className="p-6 mt-6">
        <h3 className="font-semibold mb-4">Visual Comparison</h3>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="aspect-[3/4] w-full rounded-lg" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="aspect-[3/4] w-full rounded-lg" />
            </div>
        </div>
      </Card>
    );
  }

  if (!originalPreview || !compressedPreview) {
      return null;
  }

  return (
    <Card className="p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Visual Comparison (Page 1)</h3>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            Click images to zoom
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
        {/* Connector Arrow (Desktop) */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-background rounded-full p-2 border shadow-sm text-muted-foreground">
            <ArrowRight className="h-4 w-4" />
        </div>

        {/* Original */}
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="font-medium text-muted-foreground">Original</span>
                <span className="text-sm font-semibold">{formatFileSize(originalSize)}</span>
            </div>
            <Dialog>
                <DialogTrigger asChild>
                    <div className="relative group cursor-zoom-in overflow-hidden rounded-lg border bg-muted/30">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={originalPreview} 
                            alt="Original PDF Preview" 
                            className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                             <ZoomIn className="text-white drop-shadow-md w-8 h-8" />
                        </div>
                    </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl w-full h-[80vh] flex flex-col p-0 overflow-hidden">
                    <DialogTitle className="sr-only">Original PDF Preview</DialogTitle>
                    <div className="p-4 border-b flex justify-between items-center bg-background z-10">
                        <span className="font-semibold">Original File</span>
                        <span className="text-muted-foreground">{formatFileSize(originalSize)}</span>
                    </div>
                    <div className="flex-1 overflow-auto bg-muted/30 p-4 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={originalPreview} alt="Original Full" className="max-w-full h-auto shadow-lg" />
                    </div>
                </DialogContent>
            </Dialog>
        </div>

        {/* Compressed */}
        <div className="space-y-3">
             <div className="flex items-center justify-between">
                <span className="font-medium text-purple-600 dark:text-purple-400">Compressed</span>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">{formatFileSize(compressedSize)}</span>
            </div>
             <Dialog>
                <DialogTrigger asChild>
                    <div className="relative group cursor-zoom-in overflow-hidden rounded-lg border border-purple-200 dark:border-purple-900 bg-muted/30">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={compressedPreview} 
                            alt="Compressed PDF Preview" 
                            className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                             <ZoomIn className="text-white drop-shadow-md w-8 h-8" />
                        </div>
                    </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl w-full h-[80vh] flex flex-col p-0 overflow-hidden">
                    <DialogTitle className="sr-only">Compressed PDF Preview</DialogTitle>
                    <div className="p-4 border-b flex justify-between items-center bg-background z-10">
                        <span className="font-semibold text-purple-600">Compressed File</span>
                        <span className="text-green-600 font-medium">{formatFileSize(compressedSize)}</span>
                    </div>
                    <div className="flex-1 overflow-auto bg-muted/30 p-4 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={compressedPreview} alt="Compressed Full" className="max-w-full h-auto shadow-lg" />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
      </div>
    </Card>
  );
}
