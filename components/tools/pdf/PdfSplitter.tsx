'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    AlertCircle,
    RotateCcw,
    Download,
    Check,
    Split,
    CheckCircle2,
} from 'lucide-react';
import { ProcessingStatus } from '../shared/ProcessingStatus';
import { splitPdf, parsePageRanges } from '@/lib/workers/pdf-split';
import { convertPdfToImages } from '@/lib/workers/pdf-utils';
import { formatFileSize, type ProgressUpdate } from '@/lib/workers/types';

interface PdfSplitterProps {
    file: File;
    onReset: () => void;
}

type SplitState =
    | { status: 'idle' }
    | { status: 'loading-previews'; progress: ProgressUpdate }
    | { status: 'selecting' }
    | { status: 'processing'; progress: ProgressUpdate }
    | { status: 'complete'; result: { data: ArrayBuffer; fileName: string; pageCount: number } }
    | { status: 'error'; message: string };

export function PdfSplitter({ file, onReset }: PdfSplitterProps) {
    const [state, setState] = useState<SplitState>({ status: 'idle' });
    const [thumbnails, setThumbnails] = useState<string[]>([]);
    const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
    const [rangeInput, setRangeInput] = useState('');
    const [totalPages, setTotalPages] = useState(0);

    // cleanup thumbnails
    useEffect(() => {
        return () => {
            thumbnails.forEach(url => URL.revokeObjectURL(url));
        };
    }, [thumbnails]);

    // Load PDF thumbnails on mount
    useEffect(() => {
        let cancelled = false;

        const loadThumbnails = async () => {
            try {
                setState({
                    status: 'loading-previews',
                    progress: { percent: 0, stage: 'loading', message: 'Loading PDF for preview...' }
                });

                // Use low scale for thumbnails to be fast
                const result = await convertPdfToImages(file, {
                    scale: 0.5,
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
                    const urls = result.pages.map(p => {
                        const blob = new Blob([p.data], { type: 'image/jpeg' });
                        return URL.createObjectURL(blob);
                    });

                    setThumbnails(urls);
                    setTotalPages(urls.length);
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

    // Update selection based on range input
    const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setRangeInput(value);

        // Only try to parse if valid chars
        if (/^[0-9,\-\s]*$/.test(value)) {
            const indices = parsePageRanges(value, totalPages);
            setSelectedPages(new Set(indices));
        }
    };

    // Toggle page selection from grid
    const togglePage = (pageIndex: number) => {
        const newSelection = new Set(selectedPages);
        if (newSelection.has(pageIndex)) {
            newSelection.delete(pageIndex);
        } else {
            newSelection.add(pageIndex);
        }
        setSelectedPages(newSelection);

        // Update text input to match
        // Note: Converting back to concise range string is complex, 
        // for now we just show a list or nothing if mixed.
        // Actually simplicity: We won't auto-update the text input from grid selection
        // to avoid confusing range formatting, but we could if needed. 
        // Let's just keep them in sync one-way or show "Custom Selection" text?
        // Better: Update the text input with simple comma list
        const sorted = Array.from(newSelection).map(i => i + 1).sort((a, b) => a - b);
        setRangeInput(sorted.join(', '));
    };

    const handleSplit = async () => {
        try {
            setState({
                status: 'processing',
                progress: { percent: 0, stage: 'processing', message: 'Extracting pages...' }
            });

            const result = await splitPdf(file, {
                pageRanges: rangeInput,
                onProgress: (p) => setState({ status: 'processing', progress: p })
            });

            if (result.success && result.data) {
                setState({
                    status: 'complete',
                    result: {
                        data: result.data,
                        fileName: result.fileName || 'split.pdf',
                        pageCount: result.pageCount || 0
                    }
                });
            } else {
                setState({
                    status: 'error',
                    message: result.error || 'Failed to split PDF'
                });
            }
        } catch (error) {
            setState({
                status: 'error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

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
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                            <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Split Complete!</h3>
                            <p className="text-sm text-muted-foreground">
                                Extracted {state.result.pageCount} pages to a new PDF
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
                        Download Split PDF
                    </Button>
                    <Button variant="ghost" className="gap-2" onClick={onReset}>
                        <RotateCcw className="h-4 w-4" />
                        Split Another PDF
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Configure Split */}
            <Card className="p-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Split className="h-5 w-5" />
                            Select Pages
                        </h3>
                        <span className="text-sm text-muted-foreground">
                            {file.name} ({formatFileSize(file.size)})
                        </span>
                    </div>

                    <div className="space-y-2">
                        <Label>Page Range</Label>
                        <div className="flex gap-3">
                            <Input
                                value={rangeInput}
                                onChange={handleRangeChange}
                                placeholder="e.g. 1-5, 8, 11-13"
                                className="font-mono"
                            />
                            <Button
                                onClick={handleSplit}
                                disabled={selectedPages.size === 0}
                                className="bg-purple-600 hover:bg-purple-700 min-w-[120px]"
                            >
                                Split PDF ({selectedPages.size})
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Click pages below or type ranges (e.g. "1-3, 5") to select pages to extract.
                        </p>
                    </div>
                </div>
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
                                ? 'border-purple-600 ring-2 ring-purple-600/20 shadow-lg scale-[1.02]'
                                : 'border-transparent hover:border-purple-200 dark:hover:border-purple-800'
                                }`}
                        >
                            <img
                                src={url}
                                alt={`Page ${pageNum}`}
                                className="w-full h-full object-cover"
                            />

                            {/* Overlay for selection state */}
                            <div className={`absolute inset-0 transition-colors ${isSelected ? 'bg-purple-900/10' : 'group-hover:bg-black/5'
                                }`} />

                            {/* Checkmark Badge */}
                            {isSelected && (
                                <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full p-0.5 shadow-sm">
                                    <CheckCircle2 className="h-4 w-4" />
                                </div>
                            )}

                            {/* Page Number */}
                            <div className={`absolute bottom-0 inset-x-0 py-1 text-xs font-medium text-center transition-colors ${isSelected
                                ? 'bg-purple-600 text-white'
                                : 'bg-black/50 text-white backdrop-blur-sm'
                                }`}>
                                Page {pageNum}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
