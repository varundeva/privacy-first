'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    AlertCircle,
    RotateCcw,
    Download,
    Check,
    Trash2,
    CheckCircle2,
} from 'lucide-react';
import { ProcessingStatus } from '../shared/ProcessingStatus';
import { deletePdfPages } from '@/lib/workers/pdf-delete-pages';
import { convertPdfToImages } from '@/lib/workers/pdf-utils';
import { formatFileSize, type ProgressUpdate } from '@/lib/workers/types';
import { PdfPreview } from './PdfPreview';

interface PdfDeletePagesProps {
    file: File;
    onReset: () => void;
}

type DeleteState =
    | { status: 'loading-previews'; progress: ProgressUpdate }
    | { status: 'selecting' }
    | { status: 'processing'; progress: ProgressUpdate }
    | { status: 'complete'; result: { data: ArrayBuffer; fileName: string; deletedCount: number; newPageCount: number } }
    | { status: 'error'; message: string };

export function PdfDeletePages({ file, onReset }: PdfDeletePagesProps) {
    const [state, setState] = useState<DeleteState>({
        status: 'loading-previews',
        progress: { percent: 0, stage: 'loading', message: 'Loading...' },
    });
    const [thumbnails, setThumbnails] = useState<string[]>([]);
    const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
    const [totalPages, setTotalPages] = useState(0);

    // Cleanup thumbnails on unmount
    useEffect(() => {
        return () => {
            thumbnails.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [thumbnails]);

    // Load PDF thumbnails on mount
    useEffect(() => {
        let cancelled = false;

        const loadThumbnails = async () => {
            try {
                const result = await convertPdfToImages(file, {
                    scale: 0.5,
                    outputFormat: 'jpeg',
                    quality: 0.5,
                    onProgress: (p) => {
                        if (!cancelled) {
                            setState({ status: 'loading-previews', progress: p });
                        }
                    },
                });

                if (cancelled) return;

                if (result.success && result.pages) {
                    const urls = result.pages.map((p) => {
                        const blob = new Blob([p.data], { type: 'image/jpeg' });
                        return URL.createObjectURL(blob);
                    });

                    setThumbnails(urls);
                    setTotalPages(urls.length);
                    setState({ status: 'selecting' });
                } else {
                    setState({ status: 'error', message: result.error || 'Failed to load PDF' });
                }
            } catch (error) {
                if (!cancelled) {
                    setState({
                        status: 'error',
                        message: error instanceof Error ? error.message : 'Unknown error',
                    });
                }
            }
        };

        loadThumbnails();
        return () => {
            cancelled = true;
        };
    }, [file]);

    const togglePage = (pageIndex: number) => {
        const newSelection = new Set(selectedPages);
        if (newSelection.has(pageIndex)) {
            newSelection.delete(pageIndex);
        } else {
            newSelection.add(pageIndex);
        }
        setSelectedPages(newSelection);
    };

    const handleDelete = useCallback(async () => {
        if (selectedPages.size === 0) return;
        if (selectedPages.size >= totalPages) {
            setState({ status: 'error', message: 'Cannot delete all pages from PDF' });
            return;
        }

        try {
            setState({
                status: 'processing',
                progress: { percent: 0, stage: 'processing', message: 'Deleting pages...' },
            });

            const pagesToDelete = Array.from(selectedPages).map((i) => i + 1);

            const result = await deletePdfPages(file, {
                pagesToDelete,
                onProgress: (p) => setState({ status: 'processing', progress: p }),
            });

            if (result.success && result.data) {
                setState({
                    status: 'complete',
                    result: {
                        data: result.data,
                        fileName: result.fileName || 'modified.pdf',
                        deletedCount: result.deletedCount || 0,
                        newPageCount: result.newPageCount || 0,
                    },
                });
            } else {
                setState({ status: 'error', message: result.error || 'Failed to delete pages' });
            }
        } catch (error) {
            setState({
                status: 'error',
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }, [file, selectedPages, totalPages]);

    const handleDownload = useCallback(() => {
        if (state.status !== 'complete') return;
        const blob = new Blob([state.result.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = state.result.fileName;
        a.click();
        URL.revokeObjectURL(url);
    }, [state]);

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

    if (state.status === 'loading-previews' || state.status === 'processing') {
        return <ProcessingStatus progress={state.progress} fileName={file.name} />;
    }

    if (state.status === 'complete') {
        return (
            <div className="space-y-6">
                {/* Success Card */}
                <Card className="overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                                <Check className="h-7 w-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Pages Deleted Successfully!</h3>
                                <p className="text-white/90">
                                    {state.result.deletedCount} page(s) removed from the PDF
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="text-center p-4 rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground">Original Pages</p>
                                <p className="text-xl font-bold mt-1">{totalPages}</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-red-100 dark:bg-red-900/30">
                                <p className="text-sm text-muted-foreground">Pages Deleted</p>
                                <p className="text-xl font-bold mt-1 text-red-600 dark:text-red-400">
                                    -{state.result.deletedCount}
                                </p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-green-100 dark:bg-green-900/30">
                                <p className="text-sm text-muted-foreground">New Page Count</p>
                                <p className="text-xl font-bold mt-1 text-green-600 dark:text-green-400">
                                    {state.result.newPageCount}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* PDF Preview */}
                <PdfPreview
                    pdfData={state.result.data}
                    title="Result Preview"
                    maxPages={3}
                />

                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700"
                        onClick={handleDownload}
                    >
                        <Download className="h-4 w-4" />
                        Download Modified PDF
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={onReset}>
                        <RotateCcw className="h-4 w-4" />
                        Edit Another PDF
                    </Button>
                </div>
            </div>
        );
    }

    // Selecting state
    return (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Trash2 className="h-5 w-5 text-red-500" />
                            Select Pages to Delete
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {file.name} ({formatFileSize(file.size)}) • {totalPages} pages
                        </p>
                    </div>
                    <Button
                        onClick={handleDelete}
                        disabled={selectedPages.size === 0 || selectedPages.size >= totalPages}
                        className="bg-red-600 hover:bg-red-700 text-white gap-2 disabled:bg-muted disabled:text-muted-foreground"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete {selectedPages.size > 0 ? `(${selectedPages.size})` : ''}
                    </Button>
                </div>

                {selectedPages.size >= totalPages && (
                    <div className="mb-4 p-3 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-100 text-sm border border-amber-200 dark:border-amber-700">
                        ⚠️ You cannot delete all pages. At least one page must remain.
                    </div>
                )}

                <p className="text-xs text-muted-foreground mb-4">
                    Click on pages to select them for deletion
                </p>
            </Card>

            {/* Page Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {thumbnails.map((url, i) => {
                    const pageNum = i + 1;
                    const isSelected = selectedPages.has(i);

                    return (
                        <button
                            key={i}
                            onClick={() => togglePage(i)}
                            className={`group relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${isSelected
                                ? 'border-red-600 ring-2 ring-red-600/20 shadow-lg scale-[1.02]'
                                : 'border-transparent hover:border-red-200 dark:hover:border-red-800'
                                }`}
                        >
                            <img
                                src={url}
                                alt={`Page ${pageNum}`}
                                className={`w-full h-full object-cover transition-opacity ${isSelected ? 'opacity-50' : ''
                                    }`}
                            />

                            {/* Selection overlay */}
                            <div
                                className={`absolute inset-0 transition-colors ${isSelected ? 'bg-red-900/20' : 'group-hover:bg-black/5'
                                    }`}
                            />

                            {/* Red X for selected pages */}
                            {isSelected && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-red-600 text-white rounded-full p-2 shadow-lg">
                                        <Trash2 className="h-5 w-5" />
                                    </div>
                                </div>
                            )}

                            {/* Checkmark badge */}
                            {isSelected && (
                                <div className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-0.5 shadow-sm">
                                    <CheckCircle2 className="h-4 w-4" />
                                </div>
                            )}

                            {/* Page Number */}
                            <div
                                className={`absolute bottom-0 inset-x-0 py-1 text-xs font-medium text-center transition-colors ${isSelected
                                    ? 'bg-red-600 text-white'
                                    : 'bg-black/50 text-white backdrop-blur-sm'
                                    }`}
                            >
                                Page {pageNum}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
