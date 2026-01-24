'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlertCircle,
    RotateCcw,
    Image as ImageIcon,
    Copy,
    Check,
    Code,
    FileText,
    Download,
} from 'lucide-react';
import { formatFileSize } from '@/lib/workers/types';

interface ImageToBase64Props {
    file: File;
    onReset: () => void;
}

type ConverterState =
    | { status: 'loading' }
    | { status: 'ready'; base64: string; dataUrl: string; previewUrl: string; dimensions: { width: number; height: number } }
    | { status: 'error'; message: string };

export function ImageToBase64({ file, onReset }: ImageToBase64Props) {
    const [state, setState] = useState<ConverterState>({ status: 'loading' });
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('dataurl');

    useEffect(() => {
        let cancelled = false;
        let objectUrl: string | null = null;

        const convertToBase64 = async () => {
            try {
                // Create object URL for preview
                objectUrl = URL.createObjectURL(file);

                // Get dimensions
                const img = new Image();
                await new Promise<void>((resolve, reject) => {
                    img.onload = () => resolve();
                    img.onerror = () => reject(new Error('Failed to load image'));
                    img.src = objectUrl!;
                });

                if (cancelled) return;

                // Convert to Base64
                const reader = new FileReader();
                const dataUrl = await new Promise<string>((resolve, reject) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = () => reject(new Error('Failed to read file'));
                    reader.readAsDataURL(file);
                });

                if (cancelled) return;

                // Extract just the base64 part (without data URL prefix)
                const base64 = dataUrl.split(',')[1];

                setState({
                    status: 'ready',
                    base64,
                    dataUrl,
                    previewUrl: objectUrl,
                    dimensions: { width: img.width, height: img.height },
                });

            } catch (error) {
                if (!cancelled) {
                    setState({
                        status: 'error',
                        message: error instanceof Error ? error.message : 'Failed to convert image',
                    });
                }
            }
        };

        convertToBase64();

        return () => {
            cancelled = true;
            if (objectUrl && state.status !== 'ready') {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [file]);

    // Cleanup preview URL on unmount
    useEffect(() => {
        return () => {
            if (state.status === 'ready') {
                URL.revokeObjectURL(state.previewUrl);
            }
        };
    }, [state]);

    // Copy to clipboard
    const copyToClipboard = async (value: string, field: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    // Download as text file
    const downloadAsText = (content: string, fileName: string) => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Render loading state
    if (state.status === 'loading') {
        return (
            <Card className="p-6">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30 animate-pulse">
                        <Code className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Converting to Base64...</h3>
                        <p className="text-sm text-muted-foreground">Processing image</p>
                    </div>
                </div>
            </Card>
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

    const { base64, dataUrl, previewUrl, dimensions } = state;
    const htmlImgTag = `<img src="${dataUrl}" alt="Image" />`;
    const cssBackground = `background-image: url('${dataUrl}');`;

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                            <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Converted to Base64!</h3>
                            <p className="text-sm text-muted-foreground">
                                {file.name} • {formatFileSize(file.size)} • {dimensions.width}×{dimensions.height}
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" className="gap-2" onClick={onReset}>
                        <RotateCcw className="h-4 w-4" />
                        Convert Another
                    </Button>
                </div>
            </Card>

            {/* Preview and Output */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Image Preview */}
                <Card className="p-4">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Original Image
                    </h4>
                    <div className="relative aspect-video bg-[#f0f0f0] dark:bg-[#1a1a1a] rounded-lg overflow-hidden flex items-center justify-center" style={{ backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="max-w-full max-h-full object-contain"
                        />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
                        <div className="p-2 rounded bg-muted">
                            <p className="font-medium">{formatFileSize(file.size)}</p>
                            <p className="text-muted-foreground">Original Size</p>
                        </div>
                        <div className="p-2 rounded bg-muted">
                            <p className="font-medium">{formatFileSize(base64.length)}</p>
                            <p className="text-muted-foreground">Base64 Size</p>
                        </div>
                    </div>
                </Card>

                {/* Stats */}
                <Card className="p-4">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Conversion Stats
                    </h4>
                    <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-sm text-muted-foreground">File Type</span>
                            <span className="text-sm font-medium">{file.type}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-sm text-muted-foreground">Dimensions</span>
                            <span className="text-sm font-medium">{dimensions.width} × {dimensions.height}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-sm text-muted-foreground">Original Size</span>
                            <span className="text-sm font-medium">{formatFileSize(file.size)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-sm text-muted-foreground">Base64 Length</span>
                            <span className="text-sm font-medium">{base64.length.toLocaleString()} chars</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-sm text-muted-foreground">Size Increase</span>
                            <span className="text-sm font-medium">~{Math.round((base64.length / file.size - 1) * 100)}%</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Output Formats */}
            <Card className="p-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                        <TabsList>
                            <TabsTrigger value="dataurl">Data URL</TabsTrigger>
                            <TabsTrigger value="base64">Base64 Only</TabsTrigger>
                            <TabsTrigger value="html">HTML Tag</TabsTrigger>
                            <TabsTrigger value="css">CSS</TabsTrigger>
                        </TabsList>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                                onClick={() => {
                                    const content = activeTab === 'dataurl' ? dataUrl :
                                        activeTab === 'base64' ? base64 :
                                            activeTab === 'html' ? htmlImgTag : cssBackground;
                                    copyToClipboard(content, activeTab);
                                }}
                            >
                                {copiedField === activeTab ? (
                                    <Check className="h-3.5 w-3.5" />
                                ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                )}
                                Copy
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                                onClick={() => {
                                    const content = activeTab === 'dataurl' ? dataUrl :
                                        activeTab === 'base64' ? base64 :
                                            activeTab === 'html' ? htmlImgTag : cssBackground;
                                    const ext = activeTab === 'html' ? 'html' : 'txt';
                                    downloadAsText(content, `${file.name.split('.')[0]}_${activeTab}.${ext}`);
                                }}
                            >
                                <Download className="h-3.5 w-3.5" />
                                Download
                            </Button>
                        </div>
                    </div>

                    <TabsContent value="dataurl" className="mt-0">
                        <div className="relative">
                            <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto max-h-[200px] whitespace-pre-wrap break-all">
                                {dataUrl}
                            </pre>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                            Complete data URL ready to use in src attributes
                        </p>
                    </TabsContent>

                    <TabsContent value="base64" className="mt-0">
                        <div className="relative">
                            <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto max-h-[200px] whitespace-pre-wrap break-all">
                                {base64}
                            </pre>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                            Raw Base64 string without the data URL prefix
                        </p>
                    </TabsContent>

                    <TabsContent value="html" className="mt-0">
                        <div className="relative">
                            <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto max-h-[200px] whitespace-pre-wrap break-all">
                                {htmlImgTag}
                            </pre>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                            Ready-to-use HTML img tag with embedded image
                        </p>
                    </TabsContent>

                    <TabsContent value="css" className="mt-0">
                        <div className="relative">
                            <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto max-h-[200px] whitespace-pre-wrap break-all">
                                {cssBackground}
                            </pre>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                            CSS background-image property with embedded image
                        </p>
                    </TabsContent>
                </Tabs>
            </Card>
        </div>
    );
}
