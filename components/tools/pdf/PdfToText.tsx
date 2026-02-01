'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    AlertCircle,
    RotateCcw,
    FileText,
    Copy,
    Download,
    Check,
} from 'lucide-react';
import { ProcessingStatus } from '../shared/ProcessingStatus';
import { extractTextFromPdf } from '@/lib/workers/pdf-extract-text';
import { formatFileSize, type ProgressUpdate } from '@/lib/workers/types';

interface PdfToTextProps {
    file: File;
    onReset: () => void;
}

type ExtractState =
    | { status: 'idle' }
    | { status: 'processing'; progress: ProgressUpdate }
    | {
        status: 'complete'; result: {
            text: string;
            pageCount: number;
            wordCount: number;
            characterCount: number;
        }
    }
    | { status: 'error'; message: string };

export function PdfToText({ file, onReset }: PdfToTextProps) {
    const [state, setState] = useState<ExtractState>({ status: 'idle' });
    const [copied, setCopied] = useState(false);

    const handleExtract = useCallback(async () => {
        try {
            setState({
                status: 'processing',
                progress: { percent: 0, stage: 'loading', message: 'Starting...' },
            });

            const result = await extractTextFromPdf(file, {
                separatePages: true,
                onProgress: (progress) => {
                    setState({ status: 'processing', progress });
                },
            });

            if (result.success && result.text !== undefined) {
                setState({
                    status: 'complete',
                    result: {
                        text: result.text,
                        pageCount: result.pageCount || 0,
                        wordCount: result.wordCount || 0,
                        characterCount: result.characterCount || 0,
                    },
                });
            } else {
                setState({ status: 'error', message: result.error || 'Failed to extract text' });
            }
        } catch (error) {
            setState({
                status: 'error',
                message: error instanceof Error ? error.message : 'An error occurred',
            });
        }
    }, [file]);

    const handleCopy = useCallback(async () => {
        if (state.status !== 'complete') return;
        try {
            await navigator.clipboard.writeText(state.result.text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = state.result.text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [state]);

    const handleDownload = useCallback(() => {
        if (state.status !== 'complete') return;
        const blob = new Blob([state.result.text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name.replace(/\.pdf$/i, '.txt');
        a.click();
        URL.revokeObjectURL(url);
    }, [state, file.name]);

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
                                <h3 className="text-xl font-bold">Text Extracted Successfully!</h3>
                                <p className="text-white/90">
                                    All text has been extracted from your PDF
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="text-center p-4 rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground">Pages</p>
                                <p className="text-xl font-bold mt-1">{state.result.pageCount}</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground">Words</p>
                                <p className="text-xl font-bold mt-1">{state.result.wordCount.toLocaleString()}</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground">Characters</p>
                                <p className="text-xl font-bold mt-1">{state.result.characterCount.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Text Content */}
                <Card className="p-6">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Extracted Text</span>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1">
                                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                    {copied ? 'Copied!' : 'Copy'}
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1">
                                    <Download className="h-3 w-3" />
                                    Download .txt
                                </Button>
                            </div>
                        </div>
                        <Textarea
                            value={state.result.text}
                            readOnly
                            className="min-h-[300px] font-mono text-sm"
                            placeholder="No text found in PDF"
                        />
                    </div>
                </Card>

                <Button variant="outline" className="gap-2" onClick={onReset}>
                    <RotateCcw className="h-4 w-4" />
                    Extract from Another PDF
                </Button>
            </div>
        );
    }

    // Idle state - show file info and extract button
    return (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
                        <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{file.name}</h3>
                        <p className="text-sm text-muted-foreground">
                            Size: {formatFileSize(file.size)}
                        </p>
                    </div>
                </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
                <Button
                    className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700"
                    onClick={handleExtract}
                >
                    <FileText className="h-4 w-4" />
                    Extract Text
                </Button>
                <Button variant="ghost" className="gap-2" onClick={onReset}>
                    <RotateCcw className="h-4 w-4" />
                    Choose Different File
                </Button>
            </div>
        </div>
    );
}
