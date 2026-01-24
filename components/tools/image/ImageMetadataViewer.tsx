'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    AlertCircle,
    RotateCcw,
    Image as ImageIcon,
    FileText,
    Camera,
    MapPin,
    Calendar,
    Settings,
    Palette,
    Copy,
    Check,
} from 'lucide-react';
import { formatFileSize } from '@/lib/workers/types';

interface ImageMetadataViewerProps {
    file: File;
    onReset: () => void;
}

interface ImageMetadata {
    // Basic file info
    fileName: string;
    fileSize: number;
    fileType: string;
    lastModified: Date;

    // Image dimensions
    width: number;
    height: number;
    aspectRatio: string;

    // Color info (from canvas analysis)
    colorDepth?: number;
    hasAlpha?: boolean;
}

type ViewerState =
    | { status: 'loading' }
    | { status: 'ready'; metadata: ImageMetadata; previewUrl: string }
    | { status: 'error'; message: string };

export function ImageMetadataViewer({ file, onReset }: ImageMetadataViewerProps) {
    const [state, setState] = useState<ViewerState>({ status: 'loading' });
    const [copiedField, setCopiedField] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        let objectUrl: string | null = null;

        const loadMetadata = async () => {
            try {
                // Create object URL for preview
                objectUrl = URL.createObjectURL(file);

                // Load image to get dimensions
                const img = new Image();

                await new Promise<void>((resolve, reject) => {
                    img.onload = () => resolve();
                    img.onerror = () => reject(new Error('Failed to load image'));
                    img.src = objectUrl!;
                });

                if (cancelled) return;

                // Calculate aspect ratio
                const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
                const divisor = gcd(img.width, img.height);
                const aspectRatio = `${img.width / divisor}:${img.height / divisor}`;

                // Detect alpha channel by drawing to canvas
                const canvas = document.createElement('canvas');
                canvas.width = Math.min(img.width, 100);
                canvas.height = Math.min(img.height, 100);
                const ctx = canvas.getContext('2d');

                let hasAlpha = false;
                if (ctx) {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;

                    // Check for any transparent pixels
                    for (let i = 3; i < data.length; i += 4) {
                        if (data[i] < 255) {
                            hasAlpha = true;
                            break;
                        }
                    }
                }

                const metadata: ImageMetadata = {
                    fileName: file.name,
                    fileSize: file.size,
                    fileType: file.type || 'Unknown',
                    lastModified: new Date(file.lastModified),
                    width: img.width,
                    height: img.height,
                    aspectRatio,
                    colorDepth: 24, // Standard for most web images
                    hasAlpha,
                };

                setState({
                    status: 'ready',
                    metadata,
                    previewUrl: objectUrl,
                });

            } catch (error) {
                if (!cancelled) {
                    setState({
                        status: 'error',
                        message: error instanceof Error ? error.message : 'Failed to read image',
                    });
                }
            }
        };

        loadMetadata();

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

    // Render loading state
    if (state.status === 'loading') {
        return (
            <Card className="p-6">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30 animate-pulse">
                        <ImageIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Loading Image...</h3>
                        <p className="text-sm text-muted-foreground">Reading metadata</p>
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

    const { metadata, previewUrl } = state;

    // Metadata row component
    const MetadataRow = ({ label, value, copyable = false }: { label: string; value: string; copyable?: boolean }) => (
        <div className="flex items-center justify-between py-2 border-b last:border-0">
            <span className="text-sm text-muted-foreground">{label}</span>
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{value}</span>
                {copyable && (
                    <button
                        onClick={() => copyToClipboard(value, label)}
                        className="p-1 hover:bg-muted rounded transition-colors"
                        title="Copy to clipboard"
                    >
                        {copiedField === label ? (
                            <Check className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                            <Camera className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Image Metadata</h3>
                            <p className="text-sm text-muted-foreground truncate max-w-[250px]">
                                {metadata.fileName}
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" className="gap-2" onClick={onReset}>
                        <RotateCcw className="h-4 w-4" />
                        View Another
                    </Button>
                </div>
            </Card>

            {/* Main Content */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Image Preview */}
                <Card className="p-4">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Preview
                    </h4>
                    <div className="relative aspect-video bg-[#f0f0f0] dark:bg-[#1a1a1a] rounded-lg overflow-hidden flex items-center justify-center" style={{ backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="max-w-full max-h-full object-contain"
                        />
                    </div>
                </Card>

                {/* File Information */}
                <Card className="p-4">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        File Information
                    </h4>
                    <div className="space-y-1">
                        <MetadataRow label="File Name" value={metadata.fileName} copyable />
                        <MetadataRow label="File Size" value={formatFileSize(metadata.fileSize)} copyable />
                        <MetadataRow label="File Type" value={metadata.fileType} />
                        <MetadataRow label="Last Modified" value={metadata.lastModified.toLocaleString()} />
                    </div>
                </Card>

                {/* Image Dimensions */}
                <Card className="p-4">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Dimensions
                    </h4>
                    <div className="space-y-1">
                        <MetadataRow label="Width" value={`${metadata.width} px`} copyable />
                        <MetadataRow label="Height" value={`${metadata.height} px`} copyable />
                        <MetadataRow label="Resolution" value={`${metadata.width} × ${metadata.height}`} copyable />
                        <MetadataRow label="Aspect Ratio" value={metadata.aspectRatio} />
                        <MetadataRow label="Total Pixels" value={`${(metadata.width * metadata.height).toLocaleString()} px`} />
                        <MetadataRow label="Megapixels" value={`${((metadata.width * metadata.height) / 1000000).toFixed(2)} MP`} />
                    </div>
                </Card>

                {/* Color Information */}
                <Card className="p-4">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Color Information
                    </h4>
                    <div className="space-y-1">
                        <MetadataRow label="Color Depth" value={`${metadata.colorDepth}-bit`} />
                        <MetadataRow label="Has Transparency" value={metadata.hasAlpha ? 'Yes' : 'No'} />
                        <MetadataRow label="Color Mode" value="RGB" />
                    </div>
                </Card>
            </div>

            {/* Quick Stats */}
            <Card className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                        <p className="text-2xl font-bold text-purple-600">{metadata.width}</p>
                        <p className="text-xs text-muted-foreground">Width (px)</p>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                        <p className="text-2xl font-bold text-blue-600">{metadata.height}</p>
                        <p className="text-xs text-muted-foreground">Height (px)</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                        <p className="text-2xl font-bold text-green-600">{formatFileSize(metadata.fileSize)}</p>
                        <p className="text-xs text-muted-foreground">File Size</p>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                        <p className="text-2xl font-bold text-amber-600">{metadata.aspectRatio}</p>
                        <p className="text-xs text-muted-foreground">Aspect Ratio</p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
