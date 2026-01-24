'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    AlertCircle,
    RotateCcw,
    RotateCw,
    Download,
    Check,
} from 'lucide-react';
import { ProcessingStatus } from '../shared/ProcessingStatus';
import { convertPdfToImages } from '@/lib/workers/pdf-utils';
import { formatFileSize, type ProgressUpdate } from '@/lib/workers/types';

interface PdfRotatorProps {
    file: File;
    onReset: () => void;
}

type RotateState =
    | { status: 'idle' }
    | { status: 'loading-previews'; progress: ProgressUpdate }
    | { status: 'selecting' }
    | { status: 'processing'; progress: ProgressUpdate }
    | { status: 'complete'; result: { data: ArrayBuffer; fileName: string; pageCount: number } }
    | { status: 'error'; message: string };

type RotationAngle = 0 | 90 | 180 | 270;

interface PageInfo {
    thumbnail: string;
    rotation: RotationAngle;
}

export function PdfRotator({ file, onReset }: PdfRotatorProps) {
    const [state, setState] = useState<RotateState>({ status: 'idle' });
    const [pages, setPages] = useState<PageInfo[]>([]);
    const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());

    // Cleanup thumbnails on unmount
    useEffect(() => {
        return () => {
            pages.forEach(p => URL.revokeObjectURL(p.thumbnail));
        };
    }, [pages]);

    // Load PDF thumbnails on mount
    useEffect(() => {
        let cancelled = false;

        const loadThumbnails = async () => {
            try {
                setState({
                    status: 'loading-previews',
                    progress: { percent: 0, stage: 'loading', message: 'Loading PDF for preview...' }
                });

                const result = await convertPdfToImages(file, {
                    scale: 0.4,
                    outputFormat: 'jpeg',
                    quality: 0.5,
                    onProgress: (p) => {
                        if (!cancelled) {
                            setState({ status: 'loading-previews', progress: p });
                        }
                    }
                });

                if (cancelled) return;

                if (result.success && result.pages) {
                    const pageInfos: PageInfo[] = result.pages.map(p => {
                        const blob = new Blob([p.data], { type: 'image/jpeg' });
                        return {
                            thumbnail: URL.createObjectURL(blob),
                            rotation: 0 as RotationAngle,
                        };
                    });

                    setPages(pageInfos);
                    setState({ status: 'selecting' });
                } else {
                    setState({
                        status: 'error',
                        message: result.error || 'Failed to load PDF previews'
                    });
                }
            } catch (error) {
                if (!cancelled) {
                    setState({
                        status: 'error',
                        message: error instanceof Error ? error.message : 'Unknown error'
                    });
                }
            }
        };

        loadThumbnails();

        return () => {
            cancelled = true;
        };
    }, [file]);

    // Toggle page selection
    const togglePage = (index: number) => {
        setSelectedPages(prev => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            return next;
        });
    };

    // Deselect all pages
    const deselectAll = () => {
        setSelectedPages(new Set());
    };

    // Rotate selected pages visually (preview)
    const rotateSelectedPreview = (angle: RotationAngle) => {
        setPages(prev => prev.map((page, index) => {
            if (selectedPages.has(index)) {
                const newRotation = ((page.rotation + angle) % 360) as RotationAngle;
                return { ...page, rotation: newRotation };
            }
            return page;
        }));
    };

    // Rotate all pages visually (preview)
    const rotateAllPreview = (angle: RotationAngle) => {
        setPages(prev => prev.map(page => {
            const newRotation = ((page.rotation + angle) % 360) as RotationAngle;
            return { ...page, rotation: newRotation };
        }));
    };

    // Check if any rotation has been applied
    const hasRotations = pages.some(p => p.rotation !== 0);

    // Reset all rotations
    const resetRotations = () => {
        setPages(prev => prev.map(page => ({ ...page, rotation: 0 })));
        setSelectedPages(new Set());
    };

    // Handle the actual PDF rotation
    const handleRotate = async () => {
        // Build rotation map
        const rotationMap = new Map<number, RotationAngle>();
        pages.forEach((page, index) => {
            if (page.rotation !== 0) {
                rotationMap.set(index, page.rotation);
            }
        });

        if (rotationMap.size === 0) {
            return;
        }

        try {
            setState({
                status: 'processing',
                progress: { percent: 0, stage: 'processing', message: 'Starting rotation...' }
            });

            // Dynamically load pdf-lib
            const { PDFDocument, degrees } = await import('pdf-lib');

            setState({
                status: 'processing',
                progress: { percent: 10, stage: 'loading', message: 'Reading PDF...' }
            });

            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const pdfPages = pdfDoc.getPages();

            setState({
                status: 'processing',
                progress: { percent: 30, stage: 'processing', message: 'Applying rotations...' }
            });

            let processed = 0;
            for (const [pageIndex, rotation] of rotationMap) {
                if (pageIndex >= 0 && pageIndex < pdfPages.length) {
                    const page = pdfPages[pageIndex];
                    const currentRotation = page.getRotation().angle;
                    const newRotation = (currentRotation + rotation) % 360;
                    page.setRotation(degrees(newRotation));
                }
                processed++;

                setState({
                    status: 'processing',
                    progress: {
                        percent: 30 + Math.round((processed / rotationMap.size) * 50),
                        stage: 'processing',
                        message: `Rotated page ${pageIndex + 1}...`
                    }
                });
            }

            setState({
                status: 'processing',
                progress: { percent: 85, stage: 'encoding', message: 'Saving PDF...' }
            });

            const pdfBytes = await pdfDoc.save();

            const baseName = file.name.replace(/\.pdf$/i, '');
            const fileName = `${baseName}_rotated.pdf`;

            setState({
                status: 'complete',
                result: {
                    data: pdfBytes.buffer as ArrayBuffer,
                    fileName,
                    pageCount: pdfPages.length,
                }
            });
        } catch (error) {
            setState({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to rotate PDF'
            });
        }
    };

    // Handle download
    const handleDownload = () => {
        if (state.status !== 'complete') return;
        const blob = new Blob([state.result.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = state.result.fileName;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Render error state
    if (state.status === 'error') {
        return (
            <Card className="border-destructive bg-destructive/5 p-6">
                <div className="flex items-start gap-4">
                    <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <p className="font-semibold text-destructive">Error</p>
                        <p className="text-sm text-muted-foreground">{state.message}</p>
                    </div>
                </div>
                <Button variant="outline" className="mt-4 gap-2" onClick={onReset}>
                    <RotateCcw className="h-4 w-4" />
                    Try Again
                </Button>
            </Card>
        );
    }

    // Render loading/processing state
    if (state.status === 'idle' || state.status === 'loading-previews' || state.status === 'processing') {
        const progress = state.status === 'loading-previews' || state.status === 'processing'
            ? state.progress
            : { percent: 0, stage: 'loading' as const, message: 'Initializing...' };
        return <ProcessingStatus progress={progress} fileName={file.name} />;
    }

    // Render success state
    if (state.status === 'complete') {
        return (
            <div className="space-y-6">
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                            <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold">PDF Rotated!</h3>
                            <p className="text-sm text-muted-foreground">
                                Your PDF has been rotated successfully ({state.result.pageCount} pages)
                            </p>
                        </div>
                    </div>
                </Card>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700"
                        onClick={handleDownload}
                    >
                        <Download className="h-4 w-4" />
                        Download Rotated PDF
                    </Button>
                    <Button variant="ghost" className="gap-2" onClick={onReset}>
                        <RotateCcw className="h-4 w-4" />
                        Rotate Another PDF
                    </Button>
                </div>
            </div>
        );
    }

    // Render selecting state
    return (
        <div className="space-y-6">
            {/* Header Card */}
            <Card className="p-6">
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <RotateCw className="h-5 w-5" />
                                Rotate PDF Pages
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {file.name} • {formatFileSize(file.size)} • {pages.length} pages
                            </p>
                        </div>

                        <Button
                            onClick={handleRotate}
                            disabled={!hasRotations}
                            className="bg-purple-600 hover:bg-purple-700 gap-2"
                        >
                            <Check className="h-4 w-4" />
                            Apply Rotation
                        </Button>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                        <span className="text-sm text-muted-foreground mr-2">Quick rotate all:</span>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => rotateAllPreview(90)}
                        >
                            <RotateCw className="h-3.5 w-3.5" />
                            90° CW
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => rotateAllPreview(180)}
                        >
                            180°
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => rotateAllPreview(270)}
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            90° CCW
                        </Button>
                        {hasRotations && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1.5 text-muted-foreground"
                                onClick={resetRotations}
                            >
                                Reset
                            </Button>
                        )}
                    </div>

                    {/* Selected Pages Actions */}
                    {selectedPages.size > 0 && (
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                            <span className="text-sm text-muted-foreground mr-2">
                                Rotate selected ({selectedPages.size}):
                            </span>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="gap-1.5"
                                onClick={() => rotateSelectedPreview(90)}
                            >
                                <RotateCw className="h-3.5 w-3.5" />
                                90° CW
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="gap-1.5"
                                onClick={() => rotateSelectedPreview(180)}
                            >
                                180°
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="gap-1.5"
                                onClick={() => rotateSelectedPreview(270)}
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                                90° CCW
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground"
                                onClick={deselectAll}
                            >
                                Clear selection
                            </Button>
                        </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                        💡 Click pages to select them, then use rotation buttons. Or use quick rotate to rotate all pages at once.
                    </p>
                </div>
            </Card>

            {/* Page Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {pages.map((page, index) => (
                    <div
                        key={index}
                        className={`group relative flex flex-col gap-2 rounded-xl border-2 bg-background p-2 shadow-sm transition-all cursor-pointer hover:shadow-md ${selectedPages.has(index)
                                ? 'border-purple-600 ring-2 ring-purple-600/20 shadow-lg'
                                : 'border-transparent hover:border-purple-200 dark:hover:border-purple-800'
                            }`}
                        onClick={() => togglePage(index)}
                    >
                        {/* Page Number Badge */}
                        <div className="absolute top-1 left-1 z-10">
                            <span className="px-1.5 py-0.5 text-xs font-semibold bg-background/90 backdrop-blur-sm rounded border shadow-sm">
                                {index + 1}
                            </span>
                        </div>

                        {/* Rotation Badge */}
                        {page.rotation !== 0 && (
                            <div className="absolute top-1 right-1 z-10">
                                <span className="px-1.5 py-0.5 text-xs font-semibold bg-purple-600 text-white rounded shadow-sm">
                                    {page.rotation}°
                                </span>
                            </div>
                        )}

                        {/* Selection Indicator */}
                        {selectedPages.has(index) && (
                            <div className="absolute top-1 right-1 z-20 bg-purple-600 text-white rounded-full p-0.5 shadow-sm">
                                <Check className="h-3 w-3" />
                            </div>
                        )}

                        {/* Thumbnail */}
                        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-muted border">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={page.thumbnail}
                                alt={`Page ${index + 1}`}
                                className="h-full w-full object-cover transition-transform duration-300"
                                style={{ transform: `rotate(${page.rotation}deg)` }}
                            />
                        </div>

                        {/* Page Info */}
                        <div className="flex items-center justify-center">
                            <p className="text-xs text-muted-foreground">
                                Page {index + 1}
                                {page.rotation !== 0 && (
                                    <span className="text-purple-600 font-medium"> • {page.rotation}°</span>
                                )}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer with tip */}
            {hasRotations && (
                <div className="flex justify-center text-muted-foreground text-sm gap-2">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Rotations ready - Click &quot;Apply Rotation&quot; to save</span>
                </div>
            )}
        </div>
    );
}
