'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    AlertCircle,
    RotateCcw,
    Download,
    Check,
    Hash,
    FileText,
} from 'lucide-react';
import { ProcessingStatus } from '../shared/ProcessingStatus';
import { addPageNumbers, type PageNumberPosition, type PageNumberFormat } from '@/lib/workers/pdf-page-numbers';
import { convertPdfToImages } from '@/lib/workers/pdf-utils';
import { formatFileSize, type ProgressUpdate } from '@/lib/workers/types';

interface PdfPageNumbersProps {
    file: File;
    onReset: () => void;
}

type PageNumbersState =
    | { status: 'idle' }
    | { status: 'loading-previews'; progress: ProgressUpdate }
    | { status: 'configuring' }
    | { status: 'processing'; progress: ProgressUpdate }
    | { status: 'complete'; result: { data: ArrayBuffer; fileName: string; pageCount: number } }
    | { status: 'error'; message: string };

const positionOptions: { value: PageNumberPosition; label: string; icon: string }[] = [
    { value: 'bottom-left', label: 'Bottom Left', icon: '↙' },
    { value: 'bottom-center', label: 'Bottom Center', icon: '↓' },
    { value: 'bottom-right', label: 'Bottom Right', icon: '↘' },
    { value: 'top-left', label: 'Top Left', icon: '↖' },
    { value: 'top-center', label: 'Top Center', icon: '↑' },
    { value: 'top-right', label: 'Top Right', icon: '↗' },
];

const formatOptions: { value: PageNumberFormat; label: string; example: string }[] = [
    { value: 'number', label: 'Number Only', example: '1, 2, 3...' },
    { value: 'page-n', label: 'Page N', example: 'Page 1, Page 2...' },
    { value: 'n-of-total', label: 'N of Total', example: '1 of 10, 2 of 10...' },
    { value: 'page-n-of-total', label: 'Page N of Total', example: 'Page 1 of 10...' },
];

export function PdfPageNumbers({ file, onReset }: PdfPageNumbersProps) {
    const [state, setState] = useState<PageNumbersState>({ status: 'idle' });
    const [thumbnails, setThumbnails] = useState<string[]>([]);
    const [totalPages, setTotalPages] = useState(0);

    // Configuration options
    const [position, setPosition] = useState<PageNumberPosition>('bottom-center');
    const [format, setFormat] = useState<PageNumberFormat>('number');
    const [fontSize, setFontSize] = useState(12);
    const [startNumber, setStartNumber] = useState(1);
    const [margin, setMargin] = useState(30);

    // Cleanup thumbnails on unmount
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

                const result = await convertPdfToImages(file, {
                    scale: 0.3,
                    outputFormat: 'jpeg',
                    quality: 0.4,
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
                    setState({ status: 'configuring' });
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

    // Handle adding page numbers
    const handleAddPageNumbers = async () => {
        try {
            const result = await addPageNumbers(file, {
                position,
                format,
                fontSize,
                startNumber,
                margin,
                onProgress: (p) => {
                    setState({ status: 'processing', progress: p });
                }
            });

            if (result.success && result.data) {
                setState({
                    status: 'complete',
                    result: {
                        data: result.data,
                        fileName: result.fileName!,
                        pageCount: result.pageCount!,
                    }
                });
            } else {
                setState({
                    status: 'error',
                    message: result.error || 'Failed to add page numbers'
                });
            }
        } catch (error) {
            setState({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to add page numbers'
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

    // Get preview of page number text
    const getPreviewText = (pageNum: number) => {
        switch (format) {
            case 'number':
                return String(pageNum);
            case 'page-n':
                return `Page ${pageNum}`;
            case 'n-of-total':
                return `${pageNum} of ${totalPages}`;
            case 'page-n-of-total':
                return `Page ${pageNum} of ${totalPages}`;
            default:
                return String(pageNum);
        }
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
                            <h3 className="font-semibold">Page Numbers Added!</h3>
                            <p className="text-sm text-muted-foreground">
                                Added numbers to {state.result.pageCount} pages
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
                        Download PDF
                    </Button>
                    <Button variant="ghost" className="gap-2" onClick={onReset}>
                        <RotateCcw className="h-4 w-4" />
                        Process Another PDF
                    </Button>
                </div>
            </div>
        );
    }

    // Render configuring state
    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                            <Hash className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Add Page Numbers</h3>
                            <p className="text-sm text-muted-foreground">
                                {file.name} • {formatFileSize(file.size)} • {totalPages} pages
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={handleAddPageNumbers}
                        className="bg-purple-600 hover:bg-purple-700 gap-2"
                    >
                        <Check className="h-4 w-4" />
                        Add Page Numbers
                    </Button>
                </div>
            </Card>

            {/* Configuration Options */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Position Selection */}
                <Card className="p-6">
                    <h4 className="font-semibold mb-4">Position</h4>
                    <div className="grid grid-cols-3 gap-2">
                        {positionOptions.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setPosition(opt.value)}
                                className={`p-3 rounded-lg border-2 text-center transition-all ${position === opt.value
                                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                                        : 'border-transparent bg-muted/50 hover:border-muted-foreground/20'
                                    }`}
                            >
                                <span className="text-xl">{opt.icon}</span>
                                <p className="text-xs mt-1 text-muted-foreground">{opt.label}</p>
                            </button>
                        ))}
                    </div>
                </Card>

                {/* Format Selection */}
                <Card className="p-6">
                    <h4 className="font-semibold mb-4">Format</h4>
                    <div className="space-y-2">
                        {formatOptions.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setFormat(opt.value)}
                                className={`w-full p-3 rounded-lg border-2 text-left transition-all ${format === opt.value
                                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                                        : 'border-transparent bg-muted/50 hover:border-muted-foreground/20'
                                    }`}
                            >
                                <p className="font-medium text-sm">{opt.label}</p>
                                <p className="text-xs text-muted-foreground">{opt.example}</p>
                            </button>
                        ))}
                    </div>
                </Card>

                {/* Styling Options */}
                <Card className="p-6">
                    <h4 className="font-semibold mb-4">Styling</h4>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fontSize">Font Size (pt)</Label>
                            <Input
                                id="fontSize"
                                type="number"
                                min={8}
                                max={24}
                                value={fontSize}
                                onChange={(e) => setFontSize(Number(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="margin">Margin from Edge (pt)</Label>
                            <Input
                                id="margin"
                                type="number"
                                min={10}
                                max={100}
                                value={margin}
                                onChange={(e) => setMargin(Number(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="startNumber">Start From Number</Label>
                            <Input
                                id="startNumber"
                                type="number"
                                min={1}
                                value={startNumber}
                                onChange={(e) => setStartNumber(Number(e.target.value))}
                            />
                        </div>
                    </div>
                </Card>

                {/* Preview */}
                <Card className="p-6">
                    <h4 className="font-semibold mb-4">Preview</h4>
                    <div className="relative aspect-[3/4] w-full bg-white dark:bg-gray-800 rounded-lg border shadow-inner overflow-hidden">
                        {/* Simplified page preview */}
                        <div className="absolute inset-4 border-2 border-dashed border-muted-foreground/20 rounded flex items-center justify-center">
                            <FileText className="h-12 w-12 text-muted-foreground/30" />
                        </div>

                        {/* Page number position indicator */}
                        <div
                            className={`absolute text-xs font-medium px-2 py-1 bg-purple-600 text-white rounded ${position.includes('top') ? 'top-2' : 'bottom-2'
                                } ${position.includes('left') ? 'left-2' :
                                    position.includes('right') ? 'right-2' :
                                        'left-1/2 -translate-x-1/2'
                                }`}
                        >
                            {getPreviewText(startNumber)}
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-3">
                        Page numbers will appear in this position
                    </p>
                </Card>
            </div>

            {/* Page Thumbnails */}
            <Card className="p-4">
                <h4 className="font-semibold mb-4">Pages ({totalPages})</h4>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                    {thumbnails.slice(0, 20).map((thumb, index) => (
                        <div key={index} className="relative aspect-[3/4] rounded overflow-hidden border bg-muted">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={thumb}
                                alt={`Page ${index + 1}`}
                                className="h-full w-full object-cover"
                            />
                            <span className="absolute bottom-0.5 left-0.5 text-[8px] px-1 bg-black/70 text-white rounded">
                                {index + 1}
                            </span>
                        </div>
                    ))}
                    {thumbnails.length > 20 && (
                        <div className="aspect-[3/4] rounded border bg-muted flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">+{thumbnails.length - 20}</span>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
