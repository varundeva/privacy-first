'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    AlertCircle,
    RotateCcw,
    Download,
    Check,
    Palette,
} from 'lucide-react';
import { ProcessingStatus } from '../shared/ProcessingStatus';
import { convertPdfToGrayscale } from '@/lib/workers/pdf-grayscale';
import { formatFileSize, type ProgressUpdate } from '@/lib/workers/types';
import { PdfPreview } from './PdfPreview';

interface PdfGrayscaleProps {
    file: File;
    onReset: () => void;
}

type GrayscaleState =
    | { status: 'idle' }
    | { status: 'processing'; progress: ProgressUpdate }
    | { status: 'complete'; result: { data: ArrayBuffer; fileName: string; pageCount: number } }
    | { status: 'error'; message: string };

export function PdfGrayscale({ file, onReset }: PdfGrayscaleProps) {
    const [state, setState] = useState<GrayscaleState>({ status: 'idle' });
    const [quality, setQuality] = useState(92);

    const handleConvert = useCallback(async () => {
        try {
            setState({
                status: 'processing',
                progress: { percent: 0, stage: 'loading', message: 'Starting...' },
            });

            const result = await convertPdfToGrayscale(file, {
                quality: quality / 100,
                dpi: 150,
                onProgress: (progress) => {
                    setState({ status: 'processing', progress });
                },
            });

            if (result.success && result.data) {
                setState({
                    status: 'complete',
                    result: {
                        data: result.data,
                        fileName: result.fileName || 'grayscale.pdf',
                        pageCount: result.pageCount || 0,
                    },
                });
            } else {
                setState({ status: 'error', message: result.error || 'Failed to convert PDF' });
            }
        } catch (error) {
            setState({
                status: 'error',
                message: error instanceof Error ? error.message : 'An error occurred',
            });
        }
    }, [file, quality]);

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

    if (state.status === 'processing') {
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
                                <h3 className="text-xl font-bold">Conversion Complete!</h3>
                                <p className="text-white/90">
                                    PDF successfully converted to grayscale
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="text-center p-4 rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground">Pages Converted</p>
                                <p className="text-xl font-bold mt-1">{state.result.pageCount}</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
                                <p className="text-sm text-muted-foreground">Color Mode</p>
                                <p className="text-xl font-bold mt-1 text-gray-600 dark:text-gray-400">
                                    Grayscale
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
                        Download Grayscale PDF
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={onReset}>
                        <RotateCcw className="h-4 w-4" />
                        Convert Another PDF
                    </Button>
                </div>
            </div>
        );
    }

    // Idle state
    return (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                        <Palette className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold">{file.name}</h3>
                        <p className="text-sm text-muted-foreground">
                            Size: {formatFileSize(file.size)}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Output Quality: {quality}%
                        </label>
                        <input
                            type="range"
                            min="50"
                            max="100"
                            value={quality}
                            onChange={(e) => setQuality(Number(e.target.value))}
                            className="w-full"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Higher quality = larger file size. 92% is recommended.
                        </p>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-medium text-sm mb-2">What this does:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Converts all colors to shades of gray</li>
                            <li>• Reduces file size (no color data)</li>
                            <li>• Perfect for printing in black & white</li>
                            <li>• Preserves text readability</li>
                        </ul>
                    </div>
                </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
                <Button
                    className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700"
                    onClick={handleConvert}
                >
                    <Palette className="h-4 w-4" />
                    Convert to Grayscale
                </Button>
                <Button variant="ghost" className="gap-2" onClick={onReset}>
                    <RotateCcw className="h-4 w-4" />
                    Choose Different File
                </Button>
            </div>
        </div>
    );
}
