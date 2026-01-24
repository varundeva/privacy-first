'use client';

import { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolHeader } from '../ToolHeader';
import {
    AlertCircle,
    RotateCcw,
    Image as ImageIcon,
    Download,
    FileCode,
    Check,
    Sparkles,
    Lightbulb,
    HelpCircle,
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

interface Base64ToImageProps {
    title: string;
    description: string;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
}

type ConverterState =
    | { status: 'input' }
    | { status: 'ready'; imageUrl: string; dimensions: { width: number; height: number }; fileSize: number; mimeType: string }
    | { status: 'error'; message: string };

export function Base64ToImage({ title, description, features, useCases, faq }: Base64ToImageProps) {
    const [state, setState] = useState<ConverterState>({ status: 'input' });
    const [base64Input, setBase64Input] = useState('');
    const [outputFormat, setOutputFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Detect and clean base64 input
    const processBase64 = useCallback(async () => {
        setErrorMessage(null);

        if (!base64Input.trim()) {
            setErrorMessage('Please enter a Base64 string');
            return;
        }

        try {
            let dataUrl = base64Input.trim();
            let mimeType = 'image/png';

            // Check if it's already a data URL
            if (dataUrl.startsWith('data:')) {
                // Extract mime type
                const match = dataUrl.match(/data:([^;]+);/);
                if (match) {
                    mimeType = match[1];
                }
            } else {
                // It's raw base64, try to detect or use default
                // Remove any whitespace or newlines
                dataUrl = dataUrl.replace(/\s/g, '');

                // Try to detect image type from base64 signature
                if (dataUrl.startsWith('/9j/')) {
                    mimeType = 'image/jpeg';
                } else if (dataUrl.startsWith('iVBORw')) {
                    mimeType = 'image/png';
                } else if (dataUrl.startsWith('R0lGOD')) {
                    mimeType = 'image/gif';
                } else if (dataUrl.startsWith('UklGR')) {
                    mimeType = 'image/webp';
                }

                dataUrl = `data:${mimeType};base64,${dataUrl}`;
            }

            // Validate by loading as image
            const img = new Image();
            await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error('Invalid Base64 image data'));
                img.src = dataUrl;
            });

            // Calculate approximate file size (base64 is ~33% larger than binary)
            const base64Part = dataUrl.split(',')[1] || '';
            const fileSize = Math.floor(base64Part.length * 0.75);

            setState({
                status: 'ready',
                imageUrl: dataUrl,
                dimensions: { width: img.width, height: img.height },
                fileSize,
                mimeType,
            });

        } catch (error) {
            setState({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to decode Base64 image',
            });
        }
    }, [base64Input]);

    // Download the image
    const downloadImage = useCallback(() => {
        if (state.status !== 'ready') return;

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');

            if (!ctx) return;

            // Fill white background for JPEG
            if (outputFormat === 'jpeg') {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            ctx.drawImage(img, 0, 0);

            canvas.toBlob((blob) => {
                if (!blob) return;
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `image.${outputFormat}`;
                a.click();
                URL.revokeObjectURL(url);
            }, `image/${outputFormat}`, 0.92);
        };
        img.src = state.imageUrl;
    }, [state, outputFormat]);

    // Reset to input state
    const reset = () => {
        if (state.status === 'ready') {
            // No need to revoke URL as it's a data URL, not object URL
        }
        setState({ status: 'input' });
        setBase64Input('');
    };

    // Format file size
    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Tool Header */}
            <ToolHeader title={title} description={description} />

            {/* Main Content */}
            <main className="flex-1 mx-auto max-w-4xl px-4 py-8 sm:px-6 w-full space-y-8">

                {/* Main Content */}
                {state.status === 'input' && (
                    <Card className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <FileCode className="h-5 w-5 text-purple-600" />
                                <h3 className="font-semibold">Enter Base64 String</h3>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="base64">Base64 or Data URL</Label>
                                <Textarea
                                    id="base64"
                                    placeholder="Paste your Base64 string or Data URL here...&#10;&#10;Examples:&#10;• data:image/png;base64,iVBORw0KGgo...&#10;• iVBORw0KGgo... (raw base64)"
                                    className="min-h-[200px] font-mono text-sm"
                                    value={base64Input}
                                    onChange={(e) => setBase64Input(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Supports both data URLs (data:image/...) and raw Base64 strings
                                </p>
                            </div>

                            {errorMessage && (
                                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
                                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm">{errorMessage}</p>
                                </div>
                            )}

                            <Button
                                onClick={processBase64}
                                disabled={!base64Input.trim()}
                                className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
                            >
                                <Sparkles className="h-4 w-4" />
                                Convert to Image
                            </Button>
                        </div>
                    </Card>
                )}

                {state.status === 'error' && (
                    <Card className="border-destructive bg-destructive/5 p-6">
                        <div className="flex items-start gap-4">
                            <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <p className="font-semibold text-destructive">Invalid Base64</p>
                                <p className="text-sm text-muted-foreground">{state.message}</p>
                            </div>
                        </div>
                        <Button variant="outline" className="mt-4 gap-2" onClick={reset}>
                            <RotateCcw className="h-4 w-4" />
                            Try Again
                        </Button>
                    </Card>
                )}

                {state.status === 'ready' && (
                    <div className="space-y-6">
                        {/* Success Header */}
                        <Card className="p-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                                        <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">Image Decoded!</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {state.dimensions.width} × {state.dimensions.height} • {formatFileSize(state.fileSize)}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="outline" className="gap-2" onClick={reset}>
                                    <RotateCcw className="h-4 w-4" />
                                    Convert Another
                                </Button>
                            </div>
                        </Card>

                        {/* Image Preview */}
                        <Card className="p-4">
                            <h4 className="font-semibold mb-4 flex items-center gap-2">
                                <ImageIcon className="h-4 w-4" />
                                Decoded Image
                            </h4>
                            <div className="relative bg-[#f0f0f0] dark:bg-[#1a1a1a] rounded-lg overflow-hidden flex items-center justify-center p-4" style={{ backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={state.imageUrl}
                                    alt="Decoded"
                                    className="max-w-full max-h-[400px] object-contain"
                                />
                            </div>
                        </Card>

                        {/* Download Options */}
                        <Card className="p-4">
                            <h4 className="font-semibold mb-4 flex items-center gap-2">
                                <Download className="h-4 w-4" />
                                Download
                            </h4>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 space-y-2">
                                    <Label>Output Format</Label>
                                    <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as typeof outputFormat)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="png">PNG (best quality)</SelectItem>
                                            <SelectItem value="jpeg">JPEG (smaller size)</SelectItem>
                                            <SelectItem value="webp">WebP (modern format)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-end">
                                    <Button onClick={downloadImage} className="gap-2 bg-purple-600 hover:bg-purple-700">
                                        <Download className="h-4 w-4" />
                                        Download Image
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        {/* Image Info */}
                        <Card className="p-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                                <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                                    <p className="text-2xl font-bold text-purple-600">{state.dimensions.width}</p>
                                    <p className="text-xs text-muted-foreground">Width (px)</p>
                                </div>
                                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                    <p className="text-2xl font-bold text-blue-600">{state.dimensions.height}</p>
                                    <p className="text-xs text-muted-foreground">Height (px)</p>
                                </div>
                                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                                    <p className="text-2xl font-bold text-green-600">{formatFileSize(state.fileSize)}</p>
                                    <p className="text-xs text-muted-foreground">Est. Size</p>
                                </div>
                                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                                    <p className="text-lg font-bold text-amber-600">{state.mimeType.split('/')[1].toUpperCase()}</p>
                                    <p className="text-xs text-muted-foreground">Format</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Features & FAQ Section */}
                {((features && features.length > 0) || (useCases && useCases.length > 0) || (faq && faq.length > 0)) && (
                    <div className="grid gap-8 pt-8 border-t">
                        {/* Features & Use Cases Grid */}
                        <div className="grid gap-8 md:grid-cols-2">
                            {/* Features */}
                            {features && features.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                            <Check className="h-5 w-5" />
                                        </div>
                                        <h2 className="text-xl font-semibold">Key Features</h2>
                                    </div>
                                    <Card className="p-6">
                                        <ul className="space-y-3">
                                            {features.map((feature, index) => (
                                                <li key={index} className="flex items-start gap-3 text-muted-foreground">
                                                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </Card>
                                </div>
                            )}

                            {/* Use Cases */}
                            {useCases && useCases.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                                            <Lightbulb className="h-5 w-5" />
                                        </div>
                                        <h2 className="text-xl font-semibold">Common Use Cases</h2>
                                    </div>
                                    <Card className="p-6">
                                        <ul className="space-y-3">
                                            {useCases.map((useCase, index) => (
                                                <li key={index} className="flex items-start gap-3 text-muted-foreground">
                                                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                                                    <span>{useCase}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </Card>
                                </div>
                            )}
                        </div>

                        {/* FAQ Section */}
                        {faq && faq.length > 0 && (
                            <div className="space-y-6 max-w-3xl mx-auto w-full">
                                <div className="flex items-center gap-2 justify-center pb-2">
                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                        <HelpCircle className="h-5 w-5" />
                                    </div>
                                    <h2 className="text-2xl font-semibold text-center">Frequently Asked Questions</h2>
                                </div>

                                <Accordion type="single" collapsible className="w-full">
                                    {faq.map((item, index) => (
                                        <AccordionItem key={index} value={`item-${index}`}>
                                            <AccordionTrigger className="text-left font-medium">{item.question}</AccordionTrigger>
                                            <AccordionContent className="text-muted-foreground">
                                                {item.answer}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Privacy Footer */}
            <footer className="border-t mt-auto py-8 bg-muted/10">
                <div className="mx-auto max-w-4xl px-4 sm:px-6">
                    <div className="flex flex-col items-center justify-center gap-4 text-center">
                        <span className="text-2xl">🔒</span>
                        <div>
                            <h3 className="font-medium text-foreground">100% Privacy Guarantee</h3>
                            <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
                                This tool processes data entirely in your browser using secure web technologies.
                                Your data never leaves your device and is never uploaded to any server.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

