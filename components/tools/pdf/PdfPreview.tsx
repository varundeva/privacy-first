'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { convertPdfToImages } from '@/lib/workers/pdf-utils';
import { ZoomIn, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PdfPreviewProps {
    /** The PDF data to preview */
    pdfData: ArrayBuffer;
    /** Title for the preview section */
    title?: string;
    /** Maximum pages to show in preview (default: 3) */
    maxPages?: number;
    /** Whether to show page navigation (default: true) */
    showNavigation?: boolean;
}

export function PdfPreview({
    pdfData,
    title = 'Result Preview',
    maxPages = 3,
    showNavigation = true,
}: PdfPreviewProps) {
    const [previews, setPreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        let cancelled = false;

        const loadPreviews = async () => {
            setLoading(true);
            try {
                // Convert ArrayBuffer to File for the utility
                const pdfFile = new File([pdfData], 'result.pdf', { type: 'application/pdf' });

                const result = await convertPdfToImages(pdfFile, {
                    pageRange: { start: 1, end: maxPages },
                    scale: 1.5,
                    outputFormat: 'png',
                });

                if (cancelled) return;

                if (result.success && result.pages && result.pages.length > 0) {
                    const urls = result.pages.map((page) => {
                        const blob = new Blob([page.data], { type: 'image/png' });
                        return URL.createObjectURL(blob);
                    });
                    setPreviews(urls);
                    setTotalPages(result.totalPages || result.pages.length);
                }
            } catch (error) {
                console.error('Failed to generate PDF preview', error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadPreviews();

        return () => {
            cancelled = true;
            previews.forEach((url) => URL.revokeObjectURL(url));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pdfData, maxPages]);

    if (loading) {
        return (
            <Card className="p-6">
                <h3 className="font-semibold mb-4">{title}</h3>
                <div className="space-y-4">
                    <Skeleton className="aspect-[3/4] w-full max-w-md mx-auto rounded-lg" />
                    <div className="flex justify-center gap-2">
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-16 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                    </div>
                </div>
            </Card>
        );
    }

    if (previews.length === 0) {
        return (
            <Card className="p-6">
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mb-2 opacity-50" />
                    <p>Unable to generate preview</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{title}</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    Click to zoom
                </span>
            </div>

            <div className="space-y-4">
                {/* Main Preview */}
                <Dialog>
                    <DialogTrigger asChild>
                        <div className="relative group cursor-zoom-in overflow-hidden rounded-lg border bg-muted/30 max-w-md mx-auto">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={previews[currentPage]}
                                alt={`Page ${currentPage + 1} preview`}
                                className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <ZoomIn className="text-white drop-shadow-md w-8 h-8" />
                            </div>
                        </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl w-full h-[85vh] flex flex-col p-0 overflow-hidden">
                        <DialogTitle className="sr-only">PDF Preview - Page {currentPage + 1}</DialogTitle>
                        <div className="p-4 border-b flex justify-between items-center bg-background z-10">
                            <span className="font-semibold">Page {currentPage + 1} of {totalPages}</span>
                            {showNavigation && previews.length > 1 && (
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                                        disabled={currentPage === 0}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage((p) => Math.min(previews.length - 1, p + 1))}
                                        disabled={currentPage === previews.length - 1}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 overflow-auto bg-muted/30 p-4 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={previews[currentPage]}
                                alt={`Page ${currentPage + 1} full`}
                                className="max-w-full h-auto shadow-lg"
                            />
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Page Navigation */}
                {showNavigation && previews.length > 1 && (
                    <div className="flex items-center justify-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                            disabled={currentPage === 0}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {currentPage + 1} of {Math.min(previews.length, totalPages)}
                            {totalPages > maxPages && ` (showing first ${maxPages})`}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.min(previews.length - 1, p + 1))}
                            disabled={currentPage === previews.length - 1}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}

                {/* Single page indicator */}
                {previews.length === 1 && totalPages === 1 && (
                    <p className="text-center text-sm text-muted-foreground">
                        1 page document
                    </p>
                )}

                {/* Page thumbnails for multi-page */}
                {previews.length > 1 && (
                    <div className="flex justify-center gap-2 flex-wrap">
                        {previews.map((url, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i)}
                                className={`relative w-12 aspect-[3/4] rounded border-2 overflow-hidden transition-all ${currentPage === i
                                        ? 'border-purple-600 ring-2 ring-purple-600/20'
                                        : 'border-border hover:border-purple-300'
                                    }`}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={url}
                                    alt={`Page ${i + 1} thumbnail`}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] text-center">
                                    {i + 1}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </Card>
    );
}
