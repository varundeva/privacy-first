'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    AlertCircle,
    RotateCcw,
    Download,
    Check,
    Crop,
} from 'lucide-react';
import { ProcessingStatus } from '../shared/ProcessingStatus';
import { cropPdf, type CropMargins } from '@/lib/workers/pdf-crop';
import { formatFileSize, type ProgressUpdate } from '@/lib/workers/types';
import { PdfPreview } from './PdfPreview';

interface PdfCropProps {
    file: File;
    onReset: () => void;
}

type CropState =
    | { status: 'configuring' }
    | { status: 'processing'; progress: ProgressUpdate }
    | { status: 'complete'; result: { data: ArrayBuffer; fileName: string } }
    | { status: 'error'; message: string };

export function PdfCrop({ file, onReset }: PdfCropProps) {
    const [state, setState] = useState<CropState>({ status: 'configuring' });
    const [margins, setMargins] = useState<CropMargins>({
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    });
    const [uniformCrop, setUniformCrop] = useState(true);
    const [uniformValue, setUniformValue] = useState(0);

    const handleUniformChange = (value: number) => {
        setUniformValue(value);
        if (uniformCrop) {
            setMargins({ top: value, right: value, bottom: value, left: value });
        }
    };

    const handleCrop = useCallback(async () => {
        const actualMargins = uniformCrop
            ? { top: uniformValue, right: uniformValue, bottom: uniformValue, left: uniformValue }
            : margins;

        if (actualMargins.top === 0 && actualMargins.right === 0 && actualMargins.bottom === 0 && actualMargins.left === 0) {
            setState({ status: 'error', message: 'Please specify crop margins' });
            return;
        }

        try {
            setState({
                status: 'processing',
                progress: { percent: 0, stage: 'loading', message: 'Starting...' },
            });

            const result = await cropPdf(file, {
                margins: actualMargins,
                onProgress: (progress) => {
                    setState({ status: 'processing', progress });
                },
            });

            if (result.success && result.data) {
                setState({
                    status: 'complete',
                    result: {
                        data: result.data,
                        fileName: result.fileName || 'cropped.pdf',
                    },
                });
            } else {
                setState({ status: 'error', message: result.error || 'Failed to crop PDF' });
            }
        } catch (error) {
            setState({
                status: 'error',
                message: error instanceof Error ? error.message : 'An error occurred',
            });
        }
    }, [file, margins, uniformCrop, uniformValue]);

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
                <Button
                    variant="outline"
                    className="mt-4 gap-2"
                    onClick={() => setState({ status: 'configuring' })}
                >
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
        const actualMargins = uniformCrop
            ? { top: uniformValue, right: uniformValue, bottom: uniformValue, left: uniformValue }
            : margins;

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
                                <h3 className="text-xl font-bold">PDF Cropped Successfully!</h3>
                                <p className="text-white/90">
                                    Margins have been trimmed from all pages
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                            <div className="text-center p-3 rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground">Top</p>
                                <p className="text-lg font-bold mt-1">{actualMargins.top}pt</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground">Right</p>
                                <p className="text-lg font-bold mt-1">{actualMargins.right}pt</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground">Bottom</p>
                                <p className="text-lg font-bold mt-1">{actualMargins.bottom}pt</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-muted/50">
                                <p className="text-xs text-muted-foreground">Left</p>
                                <p className="text-lg font-bold mt-1">{actualMargins.left}pt</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* PDF Preview */}
                <PdfPreview
                    pdfData={state.result.data}
                    title="Cropped PDF Preview"
                    maxPages={3}
                />

                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700"
                        onClick={handleDownload}
                    >
                        <Download className="h-4 w-4" />
                        Download Cropped PDF
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={onReset}>
                        <RotateCcw className="h-4 w-4" />
                        Crop Another PDF
                    </Button>
                </div>
            </div>
        );
    }

    // Configuration state
    return (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-900/30">
                        <Crop className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold">{file.name}</h3>
                        <p className="text-sm text-muted-foreground">
                            Size: {formatFileSize(file.size)}
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Crop mode toggle */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setUniformCrop(true)}
                            className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${uniformCrop
                                ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                                : 'border-border hover:border-purple-300'
                                }`}
                        >
                            <span className="font-medium">Uniform Crop</span>
                            <p className="text-xs text-muted-foreground">Same on all sides</p>
                        </button>
                        <button
                            onClick={() => setUniformCrop(false)}
                            className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${!uniformCrop
                                ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                                : 'border-border hover:border-purple-300'
                                }`}
                        >
                            <span className="font-medium">Custom Crop</span>
                            <p className="text-xs text-muted-foreground">Different per side</p>
                        </button>
                    </div>

                    {/* Uniform crop input */}
                    {uniformCrop ? (
                        <div>
                            <Label htmlFor="uniform-crop">Crop Amount (points)</Label>
                            <Input
                                id="uniform-crop"
                                type="number"
                                min="0"
                                max="200"
                                value={uniformValue}
                                onChange={(e) => handleUniformChange(Number(e.target.value))}
                                className="mt-1"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                1 inch = 72 points. A value of 36 crops 0.5 inches from each side.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="crop-top">Top (points)</Label>
                                <Input
                                    id="crop-top"
                                    type="number"
                                    min="0"
                                    max="200"
                                    value={margins.top}
                                    onChange={(e) => setMargins({ ...margins, top: Number(e.target.value) })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="crop-bottom">Bottom (points)</Label>
                                <Input
                                    id="crop-bottom"
                                    type="number"
                                    min="0"
                                    max="200"
                                    value={margins.bottom}
                                    onChange={(e) => setMargins({ ...margins, bottom: Number(e.target.value) })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="crop-left">Left (points)</Label>
                                <Input
                                    id="crop-left"
                                    type="number"
                                    min="0"
                                    max="200"
                                    value={margins.left}
                                    onChange={(e) => setMargins({ ...margins, left: Number(e.target.value) })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="crop-right">Right (points)</Label>
                                <Input
                                    id="crop-right"
                                    type="number"
                                    min="0"
                                    max="200"
                                    value={margins.right}
                                    onChange={(e) => setMargins({ ...margins, right: Number(e.target.value) })}
                                    className="mt-1"
                                />
                            </div>
                            <p className="col-span-2 text-xs text-muted-foreground">
                                1 inch = 72 points
                            </p>
                        </div>
                    )}

                    {/* Visual preview */}
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="relative mx-auto w-32 h-40 border-2 border-dashed border-muted-foreground/30">
                            <div
                                className="absolute bg-purple-200 dark:bg-purple-800/50"
                                style={{
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: `${Math.min((uniformCrop ? uniformValue : margins.top) / 2, 20)}%`,
                                }}
                            />
                            <div
                                className="absolute bg-purple-200 dark:bg-purple-800/50"
                                style={{
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: `${Math.min((uniformCrop ? uniformValue : margins.bottom) / 2, 20)}%`,
                                }}
                            />
                            <div
                                className="absolute bg-purple-200 dark:bg-purple-800/50"
                                style={{
                                    top: 0,
                                    bottom: 0,
                                    left: 0,
                                    width: `${Math.min((uniformCrop ? uniformValue : margins.left) / 2, 20)}%`,
                                }}
                            />
                            <div
                                className="absolute bg-purple-200 dark:bg-purple-800/50"
                                style={{
                                    top: 0,
                                    bottom: 0,
                                    right: 0,
                                    width: `${Math.min((uniformCrop ? uniformValue : margins.right) / 2, 20)}%`,
                                }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                                Content
                            </div>
                        </div>
                        <p className="text-center text-xs text-muted-foreground mt-2">
                            Purple areas will be cropped
                        </p>
                    </div>
                </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
                <Button
                    className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700"
                    onClick={handleCrop}
                >
                    <Crop className="h-4 w-4" />
                    Crop PDF
                </Button>
                <Button variant="ghost" className="gap-2" onClick={onReset}>
                    <RotateCcw className="h-4 w-4" />
                    Choose Different File
                </Button>
            </div>
        </div>
    );
}
