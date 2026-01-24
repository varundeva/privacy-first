'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    AlertCircle,
    RotateCcw,
    Download,
    Lock,
    Unlock,
    Eye,
    EyeOff,
    KeyRound,
    FileText,
    ShieldCheck,
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import { ProcessingStatus } from '../shared/ProcessingStatus';
import { formatFileSize, type ProgressUpdate } from '@/lib/workers/types';

interface PdfUnlockerProps {
    file: File;
    onReset: () => void;
}

type UnlockState =
    | { status: 'idle' }
    | { status: 'checking' }
    | { status: 'needs-password' }
    | { status: 'not-encrypted' }
    | { status: 'processing'; progress: ProgressUpdate }
    | { status: 'complete'; result: { data: ArrayBuffer; fileName: string; pageCount: number } }
    | { status: 'error'; message: string };

export function PdfUnlocker({ file, onReset }: PdfUnlockerProps) {
    const [state, setState] = useState<UnlockState>({ status: 'idle' });
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const passwordInputRef = useRef<HTMLInputElement>(null);

    // PDF Preview state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [zoom, setZoom] = useState(1);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const previewPdfRef = useRef<any>(null);

    // Check if PDF is encrypted on mount
    useEffect(() => {
        let cancelled = false;

        const checkEncryption = async () => {
            try {
                setState({ status: 'checking' });

                const pdfjs = await import('pdfjs-dist');
                pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

                const arrayBuffer = await file.arrayBuffer();

                try {
                    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

                    if (!cancelled) {
                        setState({ status: 'not-encrypted' });
                    }

                    await pdf.destroy();
                } catch (error: any) {
                    if (cancelled) return;

                    if (error.name === 'PasswordException') {
                        setState({ status: 'needs-password' });
                        setTimeout(() => passwordInputRef.current?.focus(), 100);
                    } else {
                        setState({
                            status: 'error',
                            message: error.message || 'Failed to read PDF file',
                        });
                    }
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

        checkEncryption();

        return () => {
            cancelled = true;
        };
    }, [file]);

    // Cleanup preview on unmount
    useEffect(() => {
        return () => {
            if (previewPdfRef.current) {
                previewPdfRef.current.destroy();
            }
        };
    }, []);

    // Render PDF preview page
    const renderPreviewPage = useCallback(async (pageNum: number) => {
        if (!previewPdfRef.current || !canvasRef.current) return;

        try {
            const page = await previewPdfRef.current.getPage(pageNum);
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (!context) return;

            const baseScale = 1.5;
            const viewport = page.getViewport({ scale: baseScale * zoom });

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({
                canvasContext: context,
                viewport,
                canvas,
            }).promise;
        } catch (error) {
            console.error('Failed to render preview page:', error);
        }
    }, [zoom]);

    // Re-render when page or zoom changes
    useEffect(() => {
        if (state.status === 'complete' && previewPdfRef.current) {
            renderPreviewPage(currentPage);
        }
    }, [currentPage, zoom, state.status, renderPreviewPage]);

    // Load preview after unlock completes
    const loadPreview = async (data: ArrayBuffer) => {
        try {
            const pdfjs = await import('pdfjs-dist');
            pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

            const pdf = await pdfjs.getDocument({ data: data.slice(0) }).promise;
            previewPdfRef.current = pdf;
            setTotalPages(pdf.numPages);
            setCurrentPage(1);

            // Wait for canvas to be available
            setTimeout(() => {
                renderPreviewPage(1);
            }, 100);
        } catch (error) {
            console.error('Failed to load preview:', error);
        }
    };

    // Handle unlock with password
    const handleUnlock = async () => {
        if (!password.trim()) {
            setPasswordError('Please enter the password');
            return;
        }

        setPasswordError('');

        try {
            setState({
                status: 'processing',
                progress: { percent: 0, stage: 'loading', message: 'Loading PDF libraries...' },
            });

            const [pdfjs, pdfLib] = await Promise.all([
                import('pdfjs-dist'),
                import('pdf-lib'),
            ]);

            pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

            setState({
                status: 'processing',
                progress: { percent: 5, stage: 'loading', message: 'Reading encrypted PDF...' },
            });

            const arrayBuffer = await file.arrayBuffer();

            let sourcePdf;
            try {
                sourcePdf = await pdfjs.getDocument({
                    data: arrayBuffer,
                    password: password,
                }).promise;
            } catch (error: any) {
                if (error.name === 'PasswordException') {
                    setState({ status: 'needs-password' });
                    setPasswordError('Incorrect password. Please try again.');
                    return;
                }
                throw error;
            }

            const pageCount = sourcePdf.numPages;

            setState({
                status: 'processing',
                progress: { percent: 10, stage: 'processing', message: `Rendering ${pageCount} pages...` },
            });

            const newPdf = await pdfLib.PDFDocument.create();
            const scale = 2; // 2x for 144 DPI quality

            for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
                const progressPercent = 10 + Math.round(((pageNum - 1) / pageCount) * 80);

                setState({
                    status: 'processing',
                    progress: {
                        percent: progressPercent,
                        stage: 'processing',
                        message: `Rendering page ${pageNum} of ${pageCount}...`,
                    },
                });

                const page = await sourcePdf.getPage(pageNum);
                const viewport = page.getViewport({ scale });

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                if (!context) {
                    throw new Error('Could not create canvas context');
                }

                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({
                    canvasContext: context,
                    viewport,
                    canvas,
                }).promise;

                const imageData = await new Promise<ArrayBuffer>((resolve, reject) => {
                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                blob.arrayBuffer().then(resolve).catch(reject);
                            } else {
                                reject(new Error('Failed to create image blob'));
                            }
                        },
                        'image/jpeg',
                        0.92
                    );
                });

                const image = await newPdf.embedJpg(new Uint8Array(imageData));

                const originalWidth = viewport.width / scale;
                const originalHeight = viewport.height / scale;

                const pdfPage = newPdf.addPage([originalWidth, originalHeight]);
                pdfPage.drawImage(image, {
                    x: 0,
                    y: 0,
                    width: originalWidth,
                    height: originalHeight,
                });

                // Cleanup canvas
                canvas.width = 0;
                canvas.height = 0;
            }

            await sourcePdf.destroy();

            setState({
                status: 'processing',
                progress: { percent: 95, stage: 'encoding', message: 'Saving unlocked PDF...' },
            });

            const pdfBytes = await newPdf.save();

            const baseName = file.name.replace(/\.pdf$/i, '');
            const fileName = `${baseName}_unlocked.pdf`;

            const resultData = pdfBytes.buffer as ArrayBuffer;

            // Load preview
            await loadPreview(resultData.slice(0));

            setState({
                status: 'complete',
                result: {
                    data: resultData,
                    fileName,
                    pageCount,
                },
            });
        } catch (error) {
            setState({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to unlock PDF',
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

    // Render checking state
    if (state.status === 'idle' || state.status === 'checking') {
        return (
            <Card className="p-6">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30 animate-pulse">
                        <Lock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Checking PDF...</h3>
                        <p className="text-sm text-muted-foreground">
                            Determining if the PDF is password protected
                        </p>
                    </div>
                </div>
            </Card>
        );
    }

    // Render not encrypted state
    if (state.status === 'not-encrypted') {
        return (
            <div className="space-y-6">
                <Card className="p-6 border-green-500/50 bg-green-50/50 dark:bg-green-900/10">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                            <ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-green-700 dark:text-green-400">
                                PDF is Not Password Protected
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                This PDF does not require a password to open. No unlocking needed!
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{file.name}</p>
                            <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                        </div>
                    </div>
                </Card>

                <Button variant="outline" className="w-full gap-2" onClick={onReset}>
                    <RotateCcw className="h-4 w-4" />
                    Try Another PDF
                </Button>
            </div>
        );
    }

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

    // Render processing state
    if (state.status === 'processing') {
        return <ProcessingStatus progress={state.progress} fileName={file.name} />;
    }

    // Render success state with PDF preview
    if (state.status === 'complete') {
        return (
            <div className="space-y-6">
                {/* Success Header */}
                <Card className="p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30 flex-shrink-0">
                            <Unlock className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold">PDF Unlocked!</h3>
                            <p className="text-sm text-muted-foreground">
                                {state.result.pageCount} pages successfully unlocked
                            </p>
                        </div>
                        <Button
                            className="gap-2 bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
                            onClick={handleDownload}
                        >
                            <Download className="h-4 w-4" />
                            Download PDF
                        </Button>
                    </div>
                </Card>

                {/* PDF Preview */}
                <Card className="p-4">
                    <div className="space-y-4">
                        {/* Preview Controls */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage <= 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm font-medium min-w-[100px] text-center">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage >= totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
                                    disabled={zoom <= 0.5}
                                >
                                    <ZoomOut className="h-4 w-4" />
                                </Button>
                                <span className="text-sm font-medium min-w-[60px] text-center">
                                    {Math.round(zoom * 100)}%
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setZoom(z => Math.min(2, z + 0.25))}
                                    disabled={zoom >= 2}
                                >
                                    <ZoomIn className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Canvas Preview */}
                        <div className="flex justify-center overflow-auto max-h-[600px] bg-muted/30 rounded-lg p-4">
                            <canvas
                                ref={canvasRef}
                                className="shadow-lg rounded border bg-white"
                                style={{ maxWidth: '100%', height: 'auto' }}
                            />
                        </div>
                    </div>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700"
                        onClick={handleDownload}
                    >
                        <Download className="h-4 w-4" />
                        Download Unlocked PDF
                    </Button>
                    <Button variant="ghost" className="gap-2" onClick={onReset}>
                        <RotateCcw className="h-4 w-4" />
                        Unlock Another PDF
                    </Button>
                </div>
            </div>
        );
    }

    // Render password input state (needs-password)
    return (
        <div className="space-y-6">
            {/* File Info Card */}
            <Card className="p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                        <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-sm text-amber-600 dark:text-amber-400">
                            Password protected • {formatFileSize(file.size)}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Password Input Card */}
            <Card className="p-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <KeyRound className="h-5 w-5 text-purple-600" />
                        <h3 className="font-semibold">Enter Password to Unlock</h3>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        This PDF is password protected. Enter the password to create an unlocked copy.
                    </p>

                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                            <strong>Note:</strong> The unlocked PDF will have pages rendered as high-quality images.
                            Text will not be selectable, but visual quality is preserved.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">PDF Password</Label>
                        <div className="relative">
                            <Input
                                ref={passwordInputRef}
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setPasswordError('');
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleUnlock();
                                    }
                                }}
                                placeholder="Enter the password"
                                className={passwordError ? 'border-destructive' : ''}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        {passwordError && (
                            <p className="text-sm text-destructive">{passwordError}</p>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button
                            onClick={handleUnlock}
                            disabled={!password.trim()}
                            className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700"
                        >
                            <Unlock className="h-4 w-4" />
                            Unlock PDF
                        </Button>
                        <Button variant="ghost" className="gap-2" onClick={onReset}>
                            <RotateCcw className="h-4 w-4" />
                            Cancel
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Privacy Note */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Your password is never sent anywhere - all processing happens in your browser</span>
            </div>
        </div>
    );
}
