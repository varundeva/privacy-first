'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ToolHeader } from '../ToolHeader';
import { FileUploader } from '../FileUploader';
import { ProcessingStatus } from '../shared/ProcessingStatus';
import { DownloadCard } from '../DownloadCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    RotateCcw,
    Lock,
    Unlock,
    Image as ImageIcon,
    Check,
    Lightbulb,
    HelpCircle,
    Percent,
    Hash,
    Layout,
    AlertCircle
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { resizeImage, type ProgressUpdate, type ImageResizeResult } from '@/lib/workers/worker-manager';
import { formatFileSize } from '@/lib/workers/types';

interface ImageResizerProps {
    title: string;
    description: string;
    acceptedFormats: string[];
    maxFileSize: number;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
    category?: string;
    categoryLabel?: string;
}

// Social media & common presets
const PRESETS = {
    'facebook-cover': { width: 820, height: 312, label: 'Facebook Cover' },
    'facebook-post': { width: 1200, height: 630, label: 'Facebook Post' },
    'instagram-square': { width: 1080, height: 1080, label: 'Instagram Square' },
    'instagram-portrait': { width: 1080, height: 1350, label: 'Instagram Portrait' },
    'instagram-story': { width: 1080, height: 1920, label: 'Instagram Story' },
    'twitter-post': { width: 1200, height: 675, label: 'Twitter/X Post' },
    'twitter-header': { width: 1500, height: 500, label: 'Twitter/X Header' },
    'linkedin-cover': { width: 1584, height: 396, label: 'LinkedIn Cover' },
    'linkedin-post': { width: 1200, height: 627, label: 'LinkedIn Post' },
    'youtube-thumbnail': { width: 1280, height: 720, label: 'YouTube Thumbnail' },
    'hd-1080p': { width: 1920, height: 1080, label: 'Full HD (1080p)' },
    'hd-720p': { width: 1280, height: 720, label: 'HD (720p)' },
    'web-banner': { width: 728, height: 90, label: 'Web Banner' },
    'favicon': { width: 32, height: 32, label: 'Favicon' },
    'icon-256': { width: 256, height: 256, label: 'Icon (256x256)' },
    'passport-photo': { width: 413, height: 531, label: 'Passport Photo' },
};

type ResizeState =
    | { status: 'idle' }
    | { status: 'loaded'; previewUrl: string }
    | { status: 'processing'; progress: ProgressUpdate; previewUrl: string }
    | { status: 'complete'; result: ImageResizeResult; resizedUrl: string; previewUrl: string }
    | { status: 'error'; message: string; previewUrl?: string };

export function ImageResizer({
    title,
    description,
    acceptedFormats,
    maxFileSize,
    features = [],
    useCases = [],
    faq = [],
    category,
    categoryLabel,
}: ImageResizerProps) {
    const [file, setFile] = useState<File | null>(null);
    const [state, setState] = useState<ResizeState>({ status: 'idle' });

    // Dimensions
    const [width, setWidth] = useState<number>(0);
    const [height, setHeight] = useState<number>(0);
    const [originalWidth, setOriginalWidth] = useState<number>(0);
    const [originalHeight, setOriginalHeight] = useState<number>(0);
    const [lockAspectRatio, setLockAspectRatio] = useState(true);
    const [aspectRatio, setAspectRatio] = useState(1);

    // Percentage mode
    const [percentage, setPercentage] = useState<number>(100);

    // Quality
    const [quality, setQuality] = useState<number>(92);
    const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');

    // Cleanup URLs on unmount
    useEffect(() => {
        return () => {
            if (state.status === 'loaded' || state.status === 'processing') {
                URL.revokeObjectURL(state.previewUrl);
            }
            if (state.status === 'complete') {
                URL.revokeObjectURL(state.previewUrl);
                URL.revokeObjectURL(state.resizedUrl);
            }
            if (state.status === 'error' && state.previewUrl) {
                URL.revokeObjectURL(state.previewUrl);
            }
        };
    }, [state]);

    // Handle file selection
    const handleFileSelect = useCallback(async (selectedFile: File) => {
        try {
            const previewUrl = URL.createObjectURL(selectedFile);
            setFile(selectedFile);

            // Load image to get dimensions
            const img = new Image();
            img.onload = () => {
                setOriginalWidth(img.width);
                setOriginalHeight(img.height);
                setWidth(img.width);
                setHeight(img.height);
                setAspectRatio(img.width / img.height);
                setState({ status: 'loaded', previewUrl });
            };
            img.onerror = () => {
                setState({ status: 'error', message: 'Failed to load image. Please try another file.' });
            };
            img.src = previewUrl;
        } catch (err) {
            console.error('Failed to load image', err);
            setState({ status: 'error', message: 'Failed to load image. Please try another file.' });
        }
    }, []);

    // Handle width change with aspect ratio
    const handleWidthChange = (newWidth: number) => {
        setWidth(newWidth);
        if (lockAspectRatio && aspectRatio) {
            setHeight(Math.round(newWidth / aspectRatio));
        }
    };

    // Handle height change with aspect ratio
    const handleHeightChange = (newHeight: number) => {
        setHeight(newHeight);
        if (lockAspectRatio && aspectRatio) {
            setWidth(Math.round(newHeight * aspectRatio));
        }
    };

    // Handle percentage change
    const handlePercentageChange = (newPercentage: number) => {
        setPercentage(newPercentage);
        setWidth(Math.round(originalWidth * (newPercentage / 100)));
        setHeight(Math.round(originalHeight * (newPercentage / 100)));
    };

    // Apply preset
    const applyPreset = (presetKey: string) => {
        const preset = PRESETS[presetKey as keyof typeof PRESETS];
        if (preset) {
            setWidth(preset.width);
            setHeight(preset.height);
            setLockAspectRatio(false);
        }
    };

    // Resize image using worker
    const handleResize = useCallback(async () => {
        if (!file || width <= 0 || height <= 0) return;
        if (state.status !== 'loaded' && state.status !== 'complete') return;

        const currentPreviewUrl = state.previewUrl;

        setState({
            status: 'processing',
            progress: { percent: 0, stage: 'loading', message: 'Starting resize...' },
            previewUrl: currentPreviewUrl,
        });

        try {
            const result = await resizeImage(file, width, height, {
                outputFormat: format,
                quality: quality / 100,
                onProgress: (progress) => {
                    setState(prev => {
                        if (prev.status === 'processing') {
                            return { ...prev, progress };
                        }
                        return prev;
                    });
                },
            });

            if (result.success && result.data) {
                const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'png' ? 'image/png' : 'image/webp';
                const blob = new Blob([result.data], { type: mimeType });
                const resizedUrl = URL.createObjectURL(blob);

                setState({
                    status: 'complete',
                    result,
                    resizedUrl,
                    previewUrl: currentPreviewUrl,
                });
            } else {
                setState({
                    status: 'error',
                    message: result.error || 'Failed to resize image',
                    previewUrl: currentPreviewUrl,
                });
            }
        } catch (error) {
            setState({
                status: 'error',
                message: error instanceof Error ? error.message : 'An unexpected error occurred',
                previewUrl: currentPreviewUrl,
            });
        }
    }, [file, width, height, format, quality, state]);

    const handleReset = useCallback(() => {
        if (state.status === 'loaded' || state.status === 'processing') {
            URL.revokeObjectURL(state.previewUrl);
        }
        if (state.status === 'complete') {
            URL.revokeObjectURL(state.previewUrl);
            URL.revokeObjectURL(state.resizedUrl);
        }
        if (state.status === 'error' && state.previewUrl) {
            URL.revokeObjectURL(state.previewUrl);
        }

        setFile(null);
        setState({ status: 'idle' });
        setWidth(0);
        setHeight(0);
        setOriginalWidth(0);
        setOriginalHeight(0);
        setPercentage(100);
    }, [state]);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Tool Header */}
            <ToolHeader
                title={title}
                description={description}
                category={category}
                categoryLabel={categoryLabel}
            />

            {/* Main Content */}
            <main className="flex-1 mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 w-full space-y-12">

                {state.status === 'idle' ? (
                    <div className="min-h-[400px]">
                        <FileUploader
                            acceptedFormats={acceptedFormats}
                            maxFileSize={maxFileSize}
                            onFileSelect={handleFileSelect}
                        />
                    </div>
                ) : state.status === 'error' ? (
                    <Card className="border-destructive bg-destructive/5 p-6">
                        <div className="flex items-start gap-4">
                            <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <p className="font-semibold text-destructive">Resize Failed</p>
                                <p className="text-sm text-muted-foreground">{state.message}</p>
                            </div>
                        </div>
                        <Button variant="outline" className="mt-4 gap-2" onClick={handleReset}>
                            <RotateCcw className="h-4 w-4" />
                            Try Again
                        </Button>
                    </Card>
                ) : state.status === 'processing' ? (
                    <div className="space-y-6">
                        <ProcessingStatus progress={state.progress} fileName={file?.name || 'image'} />
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Preview and Controls Grid */}
                        <div className="grid lg:grid-cols-[1fr_350px] gap-8">

                            {/* Image Preview */}
                            <div className="space-y-4">
                                <Card className="p-4 overflow-hidden">
                                    <div className="relative aspect-video bg-muted/30 rounded-lg overflow-hidden flex items-center justify-center">
                                        {state.status === 'complete' ? (
                                            <img
                                                src={state.resizedUrl}
                                                alt="Resized preview"
                                                className="max-w-full max-h-full object-contain"
                                            />
                                        ) : (
                                            <img
                                                src={state.previewUrl}
                                                alt="Original preview"
                                                className="max-w-full max-h-full object-contain"
                                            />
                                        )}
                                    </div>
                                </Card>

                                {/* Size Comparison */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <Card className="p-4 space-y-1">
                                        <p className="text-muted-foreground">Original</p>
                                        <p className="font-semibold">{originalWidth} × {originalHeight} px</p>
                                        <p className="text-muted-foreground">{file ? formatFileSize(file.size) : ''}</p>
                                    </Card>
                                    <Card className={`p-4 space-y-1 ${state.status === 'complete' ? 'border-green-500/50' : 'border-primary/50'}`}>
                                        <p className="text-muted-foreground">
                                            {state.status === 'complete' ? 'Resized' : 'Target'}
                                        </p>
                                        <p className={`font-semibold ${state.status === 'complete' ? 'text-green-600' : 'text-primary'}`}>
                                            {state.status === 'complete' ? `${state.result.newWidth} × ${state.result.newHeight}` : `${width} × ${height}`} px
                                        </p>
                                        <p className="text-muted-foreground">
                                            {state.status === 'complete' && state.result.resizedSize
                                                ? formatFileSize(state.result.resizedSize)
                                                : '–'}
                                        </p>
                                    </Card>
                                </div>

                                {/* Download Card - Show when complete */}
                                {state.status === 'complete' && (
                                    <DownloadCard
                                        fileName={state.result.fileName || `resized_${width}x${height}.${format === 'jpeg' ? 'jpg' : format}`}
                                        fileSize={state.result.resizedSize ? formatFileSize(state.result.resizedSize) : ''}
                                        fileUrl={state.resizedUrl}
                                        mimeType={format === 'jpeg' ? 'image/jpeg' : format === 'png' ? 'image/png' : 'image/webp'}
                                    />
                                )}
                            </div>

                            {/* Controls */}
                            <div className="space-y-6">
                                <Tabs defaultValue="pixels" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 mb-4">
                                        <TabsTrigger value="pixels" className="gap-1.5 text-xs sm:text-sm">
                                            <Hash className="h-3.5 w-3.5" />
                                            Pixels
                                        </TabsTrigger>
                                        <TabsTrigger value="percentage" className="gap-1.5 text-xs sm:text-sm">
                                            <Percent className="h-3.5 w-3.5" />
                                            Percent
                                        </TabsTrigger>
                                        <TabsTrigger value="presets" className="gap-1.5 text-xs sm:text-sm">
                                            <Layout className="h-3.5 w-3.5" />
                                            Presets
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* By Pixels */}
                                    <TabsContent value="pixels" className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="width">Width (px)</Label>
                                                <Input
                                                    id="width"
                                                    type="number"
                                                    value={width}
                                                    onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                                                    min={1}
                                                    max={10000}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="height">Height (px)</Label>
                                                <Input
                                                    id="height"
                                                    type="number"
                                                    value={height}
                                                    onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                                                    min={1}
                                                    max={10000}
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full gap-2"
                                            onClick={() => setLockAspectRatio(!lockAspectRatio)}
                                        >
                                            {lockAspectRatio ? (
                                                <>
                                                    <Lock className="h-4 w-4" />
                                                    Aspect Ratio Locked
                                                </>
                                            ) : (
                                                <>
                                                    <Unlock className="h-4 w-4" />
                                                    Aspect Ratio Unlocked
                                                </>
                                            )}
                                        </Button>
                                    </TabsContent>

                                    {/* By Percentage */}
                                    <TabsContent value="percentage" className="space-y-4">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label>Scale</Label>
                                                <span className="text-lg font-semibold text-primary">{percentage}%</span>
                                            </div>
                                            <Slider
                                                value={[percentage]}
                                                onValueChange={(value) => handlePercentageChange(value[0])}
                                                min={1}
                                                max={200}
                                                step={1}
                                                className="w-full"
                                            />
                                            <div className="grid grid-cols-4 gap-2">
                                                {[25, 50, 75, 100].map((p) => (
                                                    <Button
                                                        key={p}
                                                        variant={percentage === p ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => handlePercentageChange(p)}
                                                    >
                                                        {p}%
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Result: {width} × {height} px
                                        </p>
                                    </TabsContent>

                                    {/* Presets */}
                                    <TabsContent value="presets" className="space-y-4">
                                        <Select onValueChange={applyPreset}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose a preset..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="facebook-cover">Facebook Cover (820×312)</SelectItem>
                                                <SelectItem value="facebook-post">Facebook Post (1200×630)</SelectItem>
                                                <SelectItem value="instagram-square">Instagram Square (1080×1080)</SelectItem>
                                                <SelectItem value="instagram-portrait">Instagram Portrait (1080×1350)</SelectItem>
                                                <SelectItem value="instagram-story">Instagram Story (1080×1920)</SelectItem>
                                                <SelectItem value="twitter-post">Twitter/X Post (1200×675)</SelectItem>
                                                <SelectItem value="twitter-header">Twitter/X Header (1500×500)</SelectItem>
                                                <SelectItem value="linkedin-cover">LinkedIn Cover (1584×396)</SelectItem>
                                                <SelectItem value="linkedin-post">LinkedIn Post (1200×627)</SelectItem>
                                                <SelectItem value="youtube-thumbnail">YouTube Thumbnail (1280×720)</SelectItem>
                                                <SelectItem value="hd-1080p">Full HD 1080p (1920×1080)</SelectItem>
                                                <SelectItem value="hd-720p">HD 720p (1280×720)</SelectItem>
                                                <SelectItem value="passport-photo">Passport Photo (413×531)</SelectItem>
                                                <SelectItem value="favicon">Favicon (32×32)</SelectItem>
                                                <SelectItem value="icon-256">Icon (256×256)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-sm text-muted-foreground">
                                            Selected: {width} × {height} px
                                        </p>
                                    </TabsContent>
                                </Tabs>

                                {/* Output Settings */}
                                <div className="space-y-4 pt-4 border-t">
                                    <h3 className="font-medium">Output Settings</h3>

                                    <div className="space-y-2">
                                        <Label htmlFor="format">Format</Label>
                                        <Select value={format} onValueChange={(v) => setFormat(v as 'jpeg' | 'png' | 'webp')}>
                                            <SelectTrigger id="format">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="jpeg">JPEG (Smaller file)</SelectItem>
                                                <SelectItem value="png">PNG (Lossless)</SelectItem>
                                                <SelectItem value="webp">WebP (Best compression)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {format !== 'png' && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label>Quality</Label>
                                                <span className="text-sm font-medium">{quality}%</span>
                                            </div>
                                            <Slider
                                                value={[quality]}
                                                onValueChange={(value) => setQuality(value[0])}
                                                min={10}
                                                max={100}
                                                step={1}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3 pt-4 border-t">
                                    <Button
                                        className="w-full gap-2"
                                        size="lg"
                                        onClick={handleResize}
                                        disabled={width <= 0 || height <= 0}
                                    >
                                        <ImageIcon className="h-4 w-4" />
                                        {state.status === 'complete' ? 'Resize Again' : 'Resize Image'}
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        className="w-full gap-2 text-muted-foreground"
                                        onClick={handleReset}
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                        Start Over
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* SEO Content Sections */}
                {((features && features.length > 0) || (useCases && useCases.length > 0) || (faq && faq.length > 0)) && (
                    <div className="grid gap-12 pt-8 border-t">
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
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-center gap-4 text-center">
                        <span className="text-2xl">🔒</span>
                        <div>
                            <strong className="font-medium text-foreground">100% Privacy Guarantee</strong>
                            <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
                                This image resizer processes your photos entirely in your browser using Web Workers.
                                Your images are never uploaded to any server - complete privacy guaranteed.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
