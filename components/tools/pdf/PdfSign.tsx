'use client';

import { useState, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    AlertCircle,
    RotateCcw,
    Download,
    Check,
    PenTool,
    Upload,
} from 'lucide-react';
import { ProcessingStatus } from '../shared/ProcessingStatus';
import { signPdf, type SignaturePosition } from '@/lib/workers/pdf-sign';
import { formatFileSize, type ProgressUpdate } from '@/lib/workers/types';
import { PdfPreview } from './PdfPreview';

interface PdfSignProps {
    file: File;
    onReset: () => void;
}

type SignState =
    | { status: 'configuring' }
    | { status: 'processing'; progress: ProgressUpdate }
    | { status: 'complete'; result: { data: ArrayBuffer; fileName: string; signedPages: number } }
    | { status: 'error'; message: string };

const POSITIONS: { value: SignaturePosition; label: string }[] = [
    { value: 'bottom-right', label: 'Bottom Right' },
    { value: 'bottom-center', label: 'Bottom Center' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'top-right', label: 'Top Right' },
    { value: 'top-center', label: 'Top Center' },
    { value: 'top-left', label: 'Top Left' },
    { value: 'center', label: 'Center' },
];

export function PdfSign({ file, onReset }: PdfSignProps) {
    const [state, setState] = useState<SignState>({ status: 'configuring' });
    const [signatureFile, setSignatureFile] = useState<File | null>(null);
    const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
    const [position, setPosition] = useState<SignaturePosition>('bottom-right');
    const [scale, setScale] = useState(50);
    const [applyToAll, setApplyToAll] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSignatureSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSignatureFile(file);
            const url = URL.createObjectURL(file);
            if (signaturePreview) URL.revokeObjectURL(signaturePreview);
            setSignaturePreview(url);
        }
    };

    const handleSign = useCallback(async () => {
        if (!signatureFile) {
            setState({ status: 'error', message: 'Please select a signature image' });
            return;
        }

        try {
            setState({
                status: 'processing',
                progress: { percent: 0, stage: 'loading', message: 'Starting...' },
            });

            const signatureData = await signatureFile.arrayBuffer();
            const imageType = signatureFile.type === 'image/png' ? 'png' : 'jpeg';

            const result = await signPdf(file, {
                signatureImage: signatureData,
                imageType,
                pageNumbers: applyToAll ? undefined : [1], // Apply to first page only or all pages
                position,
                scale: scale / 100,
                onProgress: (progress) => {
                    setState({ status: 'processing', progress });
                },
            });

            if (result.success && result.data) {
                setState({
                    status: 'complete',
                    result: {
                        data: result.data,
                        fileName: result.fileName || 'signed.pdf',
                        signedPages: result.signedPages || 1,
                    },
                });
            } else {
                setState({ status: 'error', message: result.error || 'Failed to sign PDF' });
            }
        } catch (error) {
            setState({
                status: 'error',
                message: error instanceof Error ? error.message : 'An error occurred',
            });
        }
    }, [file, signatureFile, position, scale, applyToAll]);

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
                                <h3 className="text-xl font-bold">PDF Signed Successfully!</h3>
                                <p className="text-white/90">
                                    Your signature has been added to the document
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="text-center p-4 rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground">Pages Signed</p>
                                <p className="text-xl font-bold mt-1">{state.result.signedPages}</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                                <p className="text-sm text-muted-foreground">Position</p>
                                <p className="text-xl font-bold mt-1 text-indigo-600 dark:text-indigo-400 capitalize">
                                    {position.replace('-', ' ')}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* PDF Preview */}
                <PdfPreview
                    pdfData={state.result.data}
                    title="Signed PDF Preview"
                    maxPages={3}
                />

                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700"
                        onClick={handleDownload}
                    >
                        <Download className="h-4 w-4" />
                        Download Signed PDF
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={onReset}>
                        <RotateCcw className="h-4 w-4" />
                        Sign Another PDF
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
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                        <PenTool className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold">{file.name}</h3>
                        <p className="text-sm text-muted-foreground">
                            Size: {formatFileSize(file.size)}
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Signature Upload */}
                    <div>
                        <Label className="text-base font-semibold mb-3 block">Signature Image</Label>
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/png,image/jpeg"
                            onChange={handleSignatureSelect}
                            className="hidden"
                        />

                        {signaturePreview ? (
                            <div className="flex items-center gap-4">
                                <div className="p-4 border rounded-lg bg-white dark:bg-gray-900">
                                    <img
                                        src={signaturePreview}
                                        alt="Signature preview"
                                        className="max-h-20 max-w-40 object-contain"
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => inputRef.current?.click()}
                                >
                                    Change
                                </Button>
                            </div>
                        ) : (
                            <button
                                onClick={() => inputRef.current?.click()}
                                className="w-full border-2 border-dashed rounded-lg p-8 hover:border-purple-300 transition-colors text-center"
                            >
                                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="font-medium">Upload signature image</p>
                                <p className="text-sm text-muted-foreground">PNG or JPG with transparent background works best</p>
                            </button>
                        )}
                    </div>

                    {/* Position */}
                    <div>
                        <Label>Position</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                            {POSITIONS.map((pos) => (
                                <button
                                    key={pos.value}
                                    onClick={() => setPosition(pos.value)}
                                    className={`px-3 py-2 text-sm rounded-lg border transition-all ${position === pos.value
                                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                                        : 'border-border hover:border-purple-300'
                                        }`}
                                >
                                    {pos.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Scale */}
                    <div>
                        <Label>Size: {scale}%</Label>
                        <input
                            type="range"
                            min="10"
                            max="100"
                            value={scale}
                            onChange={(e) => setScale(Number(e.target.value))}
                            className="w-full mt-2"
                        />
                    </div>

                    {/* Apply to all pages */}
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={applyToAll}
                            onChange={(e) => setApplyToAll(e.target.checked)}
                            className="rounded"
                        />
                        <span className="text-sm">Apply signature to all pages</span>
                    </label>
                </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
                <Button
                    className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700"
                    onClick={handleSign}
                    disabled={!signatureFile}
                >
                    <PenTool className="h-4 w-4" />
                    Sign PDF
                </Button>
                <Button variant="ghost" className="gap-2" onClick={onReset}>
                    <RotateCcw className="h-4 w-4" />
                    Choose Different File
                </Button>
            </div>
        </div>
    );
}
