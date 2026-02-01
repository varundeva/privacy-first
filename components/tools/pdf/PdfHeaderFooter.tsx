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
    FileText,
    AlignLeft,
    AlignCenter,
    AlignRight,
} from 'lucide-react';
import { ProcessingStatus } from '../shared/ProcessingStatus';
import {
    addHeaderFooterToPdf,
    type HeaderFooterPosition,
    type HeaderFooterConfig,
} from '@/lib/workers/pdf-header-footer';
import { formatFileSize, type ProgressUpdate } from '@/lib/workers/types';
import { PdfPreview } from './PdfPreview';

interface PdfHeaderFooterProps {
    file: File;
    onReset: () => void;
}

type HFState =
    | { status: 'configuring' }
    | { status: 'processing'; progress: ProgressUpdate }
    | { status: 'complete'; result: { data: ArrayBuffer; fileName: string } }
    | { status: 'error'; message: string };

const POSITIONS: { value: HeaderFooterPosition; label: string; icon: React.ReactNode }[] = [
    { value: 'left', label: 'Left', icon: <AlignLeft className="h-4 w-4" /> },
    { value: 'center', label: 'Center', icon: <AlignCenter className="h-4 w-4" /> },
    { value: 'right', label: 'Right', icon: <AlignRight className="h-4 w-4" /> },
];

const PAGE_NUMBER_FORMATS: { value: HeaderFooterConfig['pageNumberFormat']; label: string }[] = [
    { value: 'number', label: '1, 2, 3' },
    { value: 'page-n', label: 'Page 1' },
    { value: 'n-of-total', label: '1 of 10' },
    { value: 'page-n-of-total', label: 'Page 1 of 10' },
];

export function PdfHeaderFooter({ file, onReset }: PdfHeaderFooterProps) {
    const [state, setState] = useState<HFState>({ status: 'configuring' });

    // Header options
    const [useHeader, setUseHeader] = useState(false);
    const [headerText, setHeaderText] = useState('');
    const [headerPosition, setHeaderPosition] = useState<HeaderFooterPosition>('center');
    const [headerIncludePageNum, setHeaderIncludePageNum] = useState(false);
    const [headerPageFormat, setHeaderPageFormat] = useState<HeaderFooterConfig['pageNumberFormat']>('page-n');

    // Footer options
    const [useFooter, setUseFooter] = useState(true);
    const [footerText, setFooterText] = useState('');
    const [footerPosition, setFooterPosition] = useState<HeaderFooterPosition>('center');
    const [footerIncludePageNum, setFooterIncludePageNum] = useState(true);
    const [footerPageFormat, setFooterPageFormat] = useState<HeaderFooterConfig['pageNumberFormat']>('page-n');

    // Common
    const [skipFirstPage, setSkipFirstPage] = useState(false);

    const handleAddHeaderFooter = useCallback(async () => {
        if (!useHeader && !useFooter) {
            setState({ status: 'error', message: 'Please enable header or footer' });
            return;
        }

        try {
            setState({
                status: 'processing',
                progress: { percent: 0, stage: 'loading', message: 'Starting...' },
            });

            const header: HeaderFooterConfig | undefined = useHeader ? {
                text: headerText,
                position: headerPosition,
                fontSize: 10,
                includePageNumber: headerIncludePageNum,
                pageNumberFormat: headerPageFormat,
            } : undefined;

            const footer: HeaderFooterConfig | undefined = useFooter ? {
                text: footerText,
                position: footerPosition,
                fontSize: 10,
                includePageNumber: footerIncludePageNum,
                pageNumberFormat: footerPageFormat,
            } : undefined;

            const result = await addHeaderFooterToPdf(file, {
                header,
                footer,
                skipFirstPage,
                onProgress: (progress) => {
                    setState({ status: 'processing', progress });
                },
            });

            if (result.success && result.data) {
                setState({
                    status: 'complete',
                    result: {
                        data: result.data,
                        fileName: result.fileName || 'modified.pdf',
                    },
                });
            } else {
                setState({ status: 'error', message: result.error || 'Failed to add header/footer' });
            }
        } catch (error) {
            setState({
                status: 'error',
                message: error instanceof Error ? error.message : 'An error occurred',
            });
        }
    }, [
        file, useHeader, useFooter, headerText, headerPosition, headerIncludePageNum,
        headerPageFormat, footerText, footerPosition, footerIncludePageNum, footerPageFormat, skipFirstPage
    ]);

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
                                <h3 className="text-xl font-bold">Header/Footer Added!</h3>
                                <p className="text-white/90">
                                    Your PDF now has the header/footer applied to all pages
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="text-center p-4 rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground">Header</p>
                                <p className="text-xl font-bold mt-1">
                                    {useHeader ? 'Added' : 'None'}
                                </p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground">Footer</p>
                                <p className="text-xl font-bold mt-1">
                                    {useFooter ? 'Added' : 'None'}
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
                        Download PDF
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={onReset}>
                        <RotateCcw className="h-4 w-4" />
                        Edit Another PDF
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
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
                        <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold">{file.name}</h3>
                        <p className="text-sm text-muted-foreground">
                            Size: {formatFileSize(file.size)}
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Header Section */}
                    <div className="space-y-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={useHeader}
                                onChange={(e) => setUseHeader(e.target.checked)}
                                className="rounded"
                            />
                            <span className="font-semibold">Add Header</span>
                        </label>

                        {useHeader && (
                            <div className="pl-6 space-y-4 border-l-2 border-purple-200 dark:border-purple-800">
                                <div>
                                    <Label htmlFor="header-text">Header Text (optional)</Label>
                                    <Input
                                        id="header-text"
                                        value={headerText}
                                        onChange={(e) => setHeaderText(e.target.value)}
                                        placeholder="e.g., Company Name"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label>Position</Label>
                                    <div className="flex gap-2 mt-1">
                                        {POSITIONS.map((pos) => (
                                            <button
                                                key={pos.value}
                                                onClick={() => setHeaderPosition(pos.value)}
                                                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all ${headerPosition === pos.value
                                                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                                                    : 'border-border hover:border-purple-300'
                                                    }`}
                                            >
                                                {pos.icon}
                                                <span className="text-sm">{pos.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={headerIncludePageNum}
                                        onChange={(e) => setHeaderIncludePageNum(e.target.checked)}
                                        className="rounded"
                                    />
                                    <span className="text-sm">Include page numbers</span>
                                </label>

                                {headerIncludePageNum && (
                                    <div className="flex flex-wrap gap-2">
                                        {PAGE_NUMBER_FORMATS.map((fmt) => (
                                            <button
                                                key={fmt.value}
                                                onClick={() => setHeaderPageFormat(fmt.value)}
                                                className={`px-3 py-1 text-sm rounded-lg border transition-all ${headerPageFormat === fmt.value
                                                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                                                    : 'border-border hover:border-purple-300'
                                                    }`}
                                            >
                                                {fmt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer Section */}
                    <div className="space-y-4 pt-4 border-t">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={useFooter}
                                onChange={(e) => setUseFooter(e.target.checked)}
                                className="rounded"
                            />
                            <span className="font-semibold">Add Footer</span>
                        </label>

                        {useFooter && (
                            <div className="pl-6 space-y-4 border-l-2 border-purple-200 dark:border-purple-800">
                                <div>
                                    <Label htmlFor="footer-text">Footer Text (optional)</Label>
                                    <Input
                                        id="footer-text"
                                        value={footerText}
                                        onChange={(e) => setFooterText(e.target.value)}
                                        placeholder="e.g., Confidential"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label>Position</Label>
                                    <div className="flex gap-2 mt-1">
                                        {POSITIONS.map((pos) => (
                                            <button
                                                key={pos.value}
                                                onClick={() => setFooterPosition(pos.value)}
                                                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all ${footerPosition === pos.value
                                                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                                                    : 'border-border hover:border-purple-300'
                                                    }`}
                                            >
                                                {pos.icon}
                                                <span className="text-sm">{pos.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={footerIncludePageNum}
                                        onChange={(e) => setFooterIncludePageNum(e.target.checked)}
                                        className="rounded"
                                    />
                                    <span className="text-sm">Include page numbers</span>
                                </label>

                                {footerIncludePageNum && (
                                    <div className="flex flex-wrap gap-2">
                                        {PAGE_NUMBER_FORMATS.map((fmt) => (
                                            <button
                                                key={fmt.value}
                                                onClick={() => setFooterPageFormat(fmt.value)}
                                                className={`px-3 py-1 text-sm rounded-lg border transition-all ${footerPageFormat === fmt.value
                                                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                                                    : 'border-border hover:border-purple-300'
                                                    }`}
                                            >
                                                {fmt.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Skip first page option */}
                    <div className="pt-4 border-t">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={skipFirstPage}
                                onChange={(e) => setSkipFirstPage(e.target.checked)}
                                className="rounded"
                            />
                            <span className="text-sm">Skip first page (title page)</span>
                        </label>
                    </div>
                </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
                <Button
                    className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700"
                    onClick={handleAddHeaderFooter}
                    disabled={!useHeader && !useFooter}
                >
                    <FileText className="h-4 w-4" />
                    Add Header/Footer
                </Button>
                <Button variant="ghost" className="gap-2" onClick={onReset}>
                    <RotateCcw className="h-4 w-4" />
                    Choose Different File
                </Button>
            </div>
        </div>
    );
}
