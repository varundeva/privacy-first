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
    FileImage,
    Plus,
    X,
    GripVertical,
} from 'lucide-react';
import { ProcessingStatus } from '../shared/ProcessingStatus';
import { imagesToPdf, type PageSize, type PageOrientation } from '@/lib/workers/images-to-pdf';
import { formatFileSize, type ProgressUpdate } from '@/lib/workers/types';
import { PdfPreview } from './PdfPreview';

interface ImagesToPdfConverterProps {
    acceptedFormats: string[];
    maxFileSize: number;
    title: string;
    description: string;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
    category: string;
    categoryLabel: string;
}

type ConvertState =
    | { status: 'selecting' }
    | { status: 'processing'; progress: ProgressUpdate }
    | { status: 'complete'; result: { data: ArrayBuffer; fileName: string; pageCount: number } }
    | { status: 'error'; message: string };

const PAGE_SIZES: { value: PageSize; label: string; desc: string }[] = [
    { value: 'a4', label: 'A4', desc: 'Standard (210×297mm)' },
    { value: 'letter', label: 'Letter', desc: 'US Letter (8.5×11in)' },
    { value: 'fit', label: 'Fit to Image', desc: 'Maintain aspect ratio' },
    { value: 'original', label: 'Original Size', desc: 'Use image dimensions' },
];

const ORIENTATIONS: { value: PageOrientation; label: string }[] = [
    { value: 'auto', label: 'Auto' },
    { value: 'portrait', label: 'Portrait' },
    { value: 'landscape', label: 'Landscape' },
];

export function ImagesToPdfConverter(props: ImagesToPdfConverterProps) {
    const [state, setState] = useState<ConvertState>({ status: 'selecting' });
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [pageSize, setPageSize] = useState<PageSize>('a4');
    const [orientation, setOrientation] = useState<PageOrientation>('auto');
    const inputRef = useRef<HTMLInputElement>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        addFiles(selectedFiles);
    };

    const addFiles = (newFiles: File[]) => {
        const imageFiles = newFiles.filter((f) =>
            f.type.startsWith('image/')
        );

        const newPreviews = imageFiles.map((f) => URL.createObjectURL(f));
        setFiles((prev) => [...prev, ...imageFiles]);
        setPreviews((prev) => [...prev, ...newPreviews]);
    };

    const removeFile = (index: number) => {
        URL.revokeObjectURL(previews[index]);
        setFiles((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newFiles = [...files];
        const newPreviews = [...previews];

        const [movedFile] = newFiles.splice(draggedIndex, 1);
        const [movedPreview] = newPreviews.splice(draggedIndex, 1);

        newFiles.splice(index, 0, movedFile);
        newPreviews.splice(index, 0, movedPreview);

        setFiles(newFiles);
        setPreviews(newPreviews);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    const handleConvert = useCallback(async () => {
        if (files.length === 0) return;

        try {
            setState({
                status: 'processing',
                progress: { percent: 0, stage: 'loading', message: 'Starting...' },
            });

            const result = await imagesToPdf(files, {
                pageSize,
                orientation,
                margin: 20,
                onProgress: (progress) => {
                    setState({ status: 'processing', progress });
                },
            });

            if (result.success && result.data) {
                setState({
                    status: 'complete',
                    result: {
                        data: result.data,
                        fileName: result.fileName || 'images.pdf',
                        pageCount: result.pageCount || files.length,
                    },
                });
            } else {
                setState({ status: 'error', message: result.error || 'Failed to create PDF' });
            }
        } catch (error) {
            setState({
                status: 'error',
                message: error instanceof Error ? error.message : 'An error occurred',
            });
        }
    }, [files, pageSize, orientation]);

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

    const handleReset = () => {
        previews.forEach((url) => URL.revokeObjectURL(url));
        setFiles([]);
        setPreviews([]);
        setState({ status: 'selecting' });
    };

    if (state.status === 'error') {
        return (
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
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
                        onClick={handleReset}
                    >
                        <RotateCcw className="h-4 w-4" />
                        Try Again
                    </Button>
                </Card>
            </div>
        );
    }

    if (state.status === 'processing') {
        return (
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
                <ProcessingStatus progress={state.progress} fileName={`${files.length} images`} />
            </div>
        );
    }

    if (state.status === 'complete') {
        return (
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">{props.title}</h1>
                    <p className="text-muted-foreground">{props.description}</p>
                </div>

                {/* Success Card */}
                <Card className="overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                                <Check className="h-7 w-7" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">PDF Created Successfully!</h3>
                                <p className="text-white/90">
                                    {state.result.pageCount} images combined into a single PDF
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="text-center p-4 rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground">Images Combined</p>
                                <p className="text-xl font-bold mt-1">{state.result.pageCount}</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-muted/50">
                                <p className="text-sm text-muted-foreground">Output File</p>
                                <p className="text-xl font-bold mt-1 text-purple-600 dark:text-purple-400">PDF</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* PDF Preview */}
                <PdfPreview
                    pdfData={state.result.data}
                    title="Generated PDF Preview"
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
                    <Button variant="outline" className="gap-2" onClick={handleReset}>
                        <RotateCcw className="h-4 w-4" />
                        Convert More Images
                    </Button>
                </div>
            </div>
        );
    }

    // Selecting state
    return (
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">{props.title}</h1>
                <p className="text-muted-foreground">{props.description}</p>
            </div>

            <Card className="p-6">
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                />

                {files.length === 0 ? (
                    <button
                        onClick={() => inputRef.current?.click()}
                        className="w-full border-2 border-dashed rounded-xl p-12 text-center hover:border-purple-300 transition-colors"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <FileImage className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="font-semibold">Click to add images</p>
                                <p className="text-sm text-muted-foreground">
                                    JPG, PNG, WebP, GIF, and BMP supported
                                </p>
                            </div>
                        </div>
                    </button>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">
                                {files.length} image{files.length > 1 ? 's' : ''} selected
                            </h3>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => inputRef.current?.click()}
                                className="gap-1"
                            >
                                <Plus className="h-4 w-4" />
                                Add More
                            </Button>
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Drag to reorder • Images will appear in this order in the PDF
                        </p>

                        {/* Image Grid */}
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {previews.map((url, i) => (
                                <div
                                    key={`${url}-${i}`}
                                    draggable
                                    onDragStart={() => handleDragStart(i)}
                                    onDragOver={(e) => handleDragOver(e, i)}
                                    onDragEnd={handleDragEnd}
                                    className={`group relative aspect-[3/4] rounded-lg overflow-hidden border-2 cursor-grab active:cursor-grabbing transition-all ${draggedIndex === i
                                        ? 'opacity-50 border-purple-600'
                                        : 'border-border hover:border-purple-300'
                                        }`}
                                >
                                    <img
                                        src={url}
                                        alt={`Image ${i + 1}`}
                                        className="w-full h-full object-cover"
                                        draggable={false}
                                    />

                                    {/* Drag handle */}
                                    <div className="absolute top-1 left-1 p-1 rounded bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                        <GripVertical className="h-3 w-3" />
                                    </div>

                                    {/* Remove button */}
                                    <button
                                        onClick={() => removeFile(i)}
                                        className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>

                                    {/* Index badge */}
                                    <div className="absolute bottom-0 inset-x-0 py-1 text-xs font-medium text-center bg-black/50 text-white backdrop-blur-sm">
                                        {i + 1}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Options */}
                        <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t">
                            <div>
                                <Label>Page Size</Label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {PAGE_SIZES.map((size) => (
                                        <button
                                            key={size.value}
                                            onClick={() => setPageSize(size.value)}
                                            className={`px-3 py-2 text-sm rounded-lg border transition-all text-left ${pageSize === size.value
                                                ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                                                : 'border-border hover:border-purple-300'
                                                }`}
                                        >
                                            <div className="font-medium">{size.label}</div>
                                            <div className="text-xs text-muted-foreground">{size.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Label>Orientation</Label>
                                <div className="flex gap-2 mt-2">
                                    {ORIENTATIONS.map((o) => (
                                        <button
                                            key={o.value}
                                            onClick={() => setOrientation(o.value)}
                                            className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-all ${orientation === o.value
                                                ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                                                : 'border-border hover:border-purple-300'
                                                }`}
                                        >
                                            {o.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            {files.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700"
                        onClick={handleConvert}
                    >
                        <FileImage className="h-4 w-4" />
                        Create PDF
                    </Button>
                    <Button variant="ghost" className="gap-2" onClick={handleReset}>
                        <RotateCcw className="h-4 w-4" />
                        Clear All
                    </Button>
                </div>
            )}

            {/* Total size info */}
            {files.length > 0 && (
                <p className="text-center text-sm text-muted-foreground">
                    Total size: {formatFileSize(files.reduce((acc, f) => acc + f.size, 0))}
                </p>
            )}
        </div>
    );
}
