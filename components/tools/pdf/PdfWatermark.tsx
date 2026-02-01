'use client';

import { useState, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    AlertCircle,
    RotateCcw,
    Download,
    Check,
    Droplets,
    Type,
    Image as ImageIcon,
    Plus,
    X,
} from 'lucide-react';
import { ProcessingStatus } from '../shared/ProcessingStatus';
import {
    addWatermarkToPdf,
    type WatermarkPosition,
} from '@/lib/workers/pdf-watermark';
import { formatFileSize, type ProgressUpdate } from '@/lib/workers/types';
import { PdfPreview } from './PdfPreview';

interface PdfWatermarkProps {
    file: File;
    onReset: () => void;
}

type WatermarkType = 'text' | 'image';

type WatermarkState =
    | { status: 'configuring' }
    | { status: 'processing'; progress: ProgressUpdate }
    | { status: 'complete'; result: { data: ArrayBuffer; fileName: string } }
    | { status: 'error'; message: string };

const POSITIONS: { value: WatermarkPosition; label: string }[] = [
    { value: 'center', label: 'Center' },
    { value: 'diagonal', label: 'Diagonal' },
    { value: 'top-left', label: 'Top Left' },
    { value: 'top-center', label: 'Top Center' },
    { value: 'top-right', label: 'Top Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'bottom-center', label: 'Bottom Center' },
    { value: 'bottom-right', label: 'Bottom Right' },
];

export function PdfWatermark({ file, onReset }: PdfWatermarkProps) {
    const [state, setState] = useState<WatermarkState>({ status: 'configuring' });
    const [watermarkType, setWatermarkType] = useState<WatermarkType>('text');
    const [text, setText] = useState('CONFIDENTIAL');
    const [fontSize, setFontSize] = useState(48);
    const [opacity, setOpacity] = useState(30);
    const [position, setPosition] = useState<WatermarkPosition>('diagonal');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageScale, setImageScale] = useState(50);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const url = URL.createObjectURL(file);
            setImagePreview(url);
        }
    };

    const clearImage = () => {
        setImageFile(null);
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
            setImagePreview(null);
        }
        if (imageInputRef.current) {
            imageInputRef.current.value = '';
        }
    };

    const handleAddWatermark = useCallback(async () => {
        try {
            setState({
                status: 'processing',
                progress: { percent: 0, stage: 'loading', message: 'Starting...' },
            });

            let watermarkConfig;

            if (watermarkType === 'text') {
                if (!text.trim()) {
                    setState({ status: 'error', message: 'Please enter watermark text' });
                    return;
                }
                watermarkConfig = {
                    type: 'text' as const,
                    text: text.trim(),
                    fontSize,
                    opacity: opacity / 100,
                    position,
                    color: { r: 0.5, g: 0.5, b: 0.5 },
                };
            } else {
                if (!imageFile) {
                    setState({ status: 'error', message: 'Please select a watermark image' });
                    return;
                }
                const imageData = await imageFile.arrayBuffer();
                const imageType: 'png' | 'jpeg' = imageFile.type === 'image/png' ? 'png' : 'jpeg';

                watermarkConfig = {
                    type: 'image' as const,
                    imageData,
                    imageType,
                    scale: imageScale / 100,
                    opacity: opacity / 100,
                    position,
                };
            }

            const result = await addWatermarkToPdf(file, {
                watermark: watermarkConfig,
                onProgress: (progress) => {
                    setState({ status: 'processing', progress });
                },
            });

            if (result.success && result.data) {
                setState({
                    status: 'complete',
                    result: {
                        data: result.data,
                        fileName: result.fileName || 'watermarked.pdf',
                    },
                });
            } else {
                setState({ status: 'error', message: result.error || 'Failed to add watermark' });
            }
        } catch (error) {
            setState({
                status: 'error',
                message: error instanceof Error ? error.message : 'An error occurred',
            });
        }
    }, [file, watermarkType, text, fontSize, opacity, position, imageFile, imageScale]);

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
                                <h3 className="text-xl font-bold">Watermark Added Successfully!</h3>
                                <p className="text-white/90">
                                    Your PDF now has the watermark applied to all pages
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="text-center p-4 rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground">Watermark Type</p>
                                <p className="text-xl font-bold mt-1 capitalize">{watermarkType}</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                <p className="text-sm text-muted-foreground">Position</p>
                                <p className="text-xl font-bold mt-1 text-blue-600 dark:text-blue-400 capitalize">
                                    {position.replace('-', ' ')}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* PDF Preview */}
                <PdfPreview
                    pdfData={state.result.data}
                    title="Watermarked PDF Preview"
                    maxPages={3}
                />

                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700"
                        onClick={handleDownload}
                    >
                        <Download className="h-4 w-4" />
                        Download Watermarked PDF
                    </Button>
                    <Button variant="outline" className="gap-2" onClick={onReset}>
                        <RotateCcw className="h-4 w-4" />
                        Watermark Another PDF
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
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                        <Droplets className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold">{file.name}</h3>
                        <p className="text-sm text-muted-foreground">
                            Size: {formatFileSize(file.size)}
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Watermark Type Toggle */}
                    <div>
                        <Label className="text-base font-semibold mb-3 block">Watermark Type</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setWatermarkType('text')}
                                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${watermarkType === 'text'
                                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                                    : 'border-border hover:border-purple-300'
                                    }`}
                            >
                                <Type className="h-5 w-5" />
                                <span className="font-medium">Text</span>
                            </button>
                            <button
                                onClick={() => setWatermarkType('image')}
                                className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${watermarkType === 'image'
                                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                                    : 'border-border hover:border-purple-300'
                                    }`}
                            >
                                <ImageIcon className="h-5 w-5" />
                                <span className="font-medium">Image</span>
                            </button>
                        </div>
                    </div>

                    {/* Text Watermark Options */}
                    {watermarkType === 'text' && (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="watermark-text">Watermark Text</Label>
                                <Input
                                    id="watermark-text"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="e.g., CONFIDENTIAL, DRAFT, SAMPLE"
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="font-size">Font Size: {fontSize}px</Label>
                                <input
                                    id="font-size"
                                    type="range"
                                    min="12"
                                    max="120"
                                    value={fontSize}
                                    onChange={(e) => setFontSize(Number(e.target.value))}
                                    className="w-full mt-1"
                                />
                            </div>
                        </div>
                    )}

                    {/* Image Watermark Options */}
                    {watermarkType === 'image' && (
                        <div className="space-y-4">
                            <div>
                                <Label>Watermark Image</Label>
                                <input
                                    ref={imageInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />
                                {imagePreview ? (
                                    <div className="mt-2 relative inline-block">
                                        <img
                                            src={imagePreview}
                                            alt="Watermark preview"
                                            className="max-h-24 rounded border"
                                        />
                                        <button
                                            onClick={clearImage}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => imageInputRef.current?.click()}
                                        className="mt-2 flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg hover:border-purple-300 transition-colors"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Select Image (PNG or JPG)
                                    </button>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="image-scale">Scale: {imageScale}%</Label>
                                <input
                                    id="image-scale"
                                    type="range"
                                    min="10"
                                    max="100"
                                    value={imageScale}
                                    onChange={(e) => setImageScale(Number(e.target.value))}
                                    className="w-full mt-1"
                                />
                            </div>
                        </div>
                    )}

                    {/* Common Options */}
                    <div className="space-y-4 pt-4 border-t">
                        <div>
                            <Label htmlFor="opacity">Opacity: {opacity}%</Label>
                            <input
                                id="opacity"
                                type="range"
                                min="5"
                                max="100"
                                value={opacity}
                                onChange={(e) => setOpacity(Number(e.target.value))}
                                className="w-full mt-1"
                            />
                        </div>

                        <div>
                            <Label>Position</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                                {POSITIONS.map((pos) => (
                                    <button
                                        key={pos.value}
                                        onClick={() => setPosition(pos.value)}
                                        className={`px-3 py-2 text-sm rounded-lg border transition-all ${position === pos.value
                                            ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                                            : 'border-border hover:border-purple-300'
                                            }`}
                                    >
                                        {pos.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3">
                <Button
                    className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700"
                    onClick={handleAddWatermark}
                    disabled={watermarkType === 'text' ? !text.trim() : !imageFile}
                >
                    <Droplets className="h-4 w-4" />
                    Add Watermark
                </Button>
                <Button variant="ghost" className="gap-2" onClick={onReset}>
                    <RotateCcw className="h-4 w-4" />
                    Choose Different File
                </Button>
            </div>
        </div>
    );
}
