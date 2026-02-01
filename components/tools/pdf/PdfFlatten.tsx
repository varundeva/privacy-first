'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    AlertCircle,
    RotateCcw,
    Download,
    Check,
    Layers,
} from 'lucide-react';
import { ProcessingStatus } from '../shared/ProcessingStatus';
import { flattenPdf } from '@/lib/workers/pdf-flatten';
import { formatFileSize, type ProgressUpdate } from '@/lib/workers/types';
import { PdfPreview } from './PdfPreview';

interface PdfFlattenProps {
    file: File;
    onReset: () => void;
}

type FlattenState =
    | { status: 'idle' }
    | { status: 'processing'; progress: ProgressUpdate }
    | { status: 'complete'; result: { data: ArrayBuffer; fileName: string; formsFlattened: number } }
    | { status: 'error'; message: string };

export function PdfFlatten({ file, onReset }: PdfFlattenProps) {
    const [state, setState] = useState<FlattenState>({ status: 'idle' });

    const handleFlatten = useCallback(async () => {
        try {
            setState({
                status: 'processing',
                progress: { percent: 0, stage: 'loading', message: 'Starting...' },
            });

            const result = await flattenPdf(file, {
                flattenForms: true,
                flattenAnnotations: true,
                onProgress: (progress) => {
                    setState({ status: 'processing', progress });
                },
            });

            if (result.success && result.data) {
                setState({
                    status: 'complete',
                    result: {
                        data: result.data,
                        fileName: result.fileName || 'flattened.pdf',
                        formsFlattened: result.formsFlattened || 0,
                    },
                });
            } else {
                setState({ status: 'error', message: result.error || 'Failed to flatten PDF' });
            }
        } catch (error) {
            setState({
                status: 'error',
                message: error instanceof Error ? error.message : 'An error occurred',
            });
        }
    }, [file]);

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
                                <h3 className="text-xl font-bold">PDF Flattened Successfully!</h3>
                                <p className="text-white/90">
                                    All form fields converted to static content
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="text-center p-4 rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground">Form Fields Flattened</p>
                                <p className="text-xl font-bold mt-1">
                                    {state.result.formsFlattened > 0 ? state.result.formsFlattened : 'None found'}
                                </p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-green-100 dark:bg-green-900/30">
                                <p className="text-sm text-muted-foreground">Status</p>
                                <p className="text-xl font-bold mt-1 text-green-600 dark:text-green-400">
                                    Complete
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* PDF Preview */}
                <PdfPreview
                    pdfData={state.result.data}
                    title="Flattened PDF Preview"
                    maxPages={3}
                />

                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700"
                        onClick={handleDownload}
                    >
                        <Download className="h-4 w-4" />
                        Download Flattened PDF
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={onReset}>
                        <RotateCcw className="h-4 w-4" />
                        Flatten Another PDF
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
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                        <Layers className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold">{file.name}</h3>
                        <p className="text-sm text-muted-foreground">
                            Size: {formatFileSize(file.size)}
                        </p>
                    </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                    <h4 className="font-medium">What flattening does:</h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                        <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>Converts form fields (text boxes, checkboxes, dropdowns) to static text</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>Makes the PDF non-editable (locks in current values)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>Reduces file size by removing form data structures</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>Ensures consistent appearance across all PDF viewers</span>
                        </li>
                    </ul>
                </div>

                <div className="mt-4 p-3 bg-amber-100 dark:bg-amber-900/40 rounded-lg text-sm text-amber-800 dark:text-amber-100 border border-amber-200 dark:border-amber-700">
                    <strong>Note:</strong> This action is irreversible. Form fields cannot be restored after flattening.
                </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
                <Button
                    className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700"
                    onClick={handleFlatten}
                >
                    <Layers className="h-4 w-4" />
                    Flatten PDF
                </Button>
                <Button variant="ghost" className="gap-2" onClick={onReset}>
                    <RotateCcw className="h-4 w-4" />
                    Choose Different File
                </Button>
            </div>
        </div>
    );
}
