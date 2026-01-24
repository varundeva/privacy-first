'use client';

import { useState, useEffect } from 'react';
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
    User,
    BookOpen,
    Tag,
    Settings,
    Calendar,
    Save,
} from 'lucide-react';
import { ProcessingStatus } from '../shared/ProcessingStatus';
import { readPdfMetadata, editPdfMetadata, type PdfMetadata } from '@/lib/workers/pdf-metadata';
import { formatFileSize, type ProgressUpdate } from '@/lib/workers/types';

interface PdfMetadataEditorProps {
    file: File;
    onReset: () => void;
}

type MetadataState =
    | { status: 'idle' }
    | { status: 'loading'; progress: ProgressUpdate }
    | { status: 'editing' }
    | { status: 'processing'; progress: ProgressUpdate }
    | { status: 'complete'; result: { data: ArrayBuffer; fileName: string; pageCount: number } }
    | { status: 'error'; message: string };

export function PdfMetadataEditor({ file, onReset }: PdfMetadataEditorProps) {
    const [state, setState] = useState<MetadataState>({ status: 'idle' });
    const [pageCount, setPageCount] = useState(0);

    // Original metadata (for comparison)
    const [originalMetadata, setOriginalMetadata] = useState<PdfMetadata>({});

    // Editable metadata fields
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [subject, setSubject] = useState('');
    const [keywords, setKeywords] = useState('');
    const [creator, setCreator] = useState('');
    const [producer, setProducer] = useState('');

    // Load metadata on mount
    useEffect(() => {
        let cancelled = false;

        const loadMetadata = async () => {
            try {
                const result = await readPdfMetadata(file, (p) => {
                    if (!cancelled) {
                        setState({ status: 'loading', progress: p });
                    }
                });

                if (cancelled) return;

                if (result.success && result.metadata) {
                    setOriginalMetadata(result.metadata);
                    setTitle(result.metadata.title || '');
                    setAuthor(result.metadata.author || '');
                    setSubject(result.metadata.subject || '');
                    setKeywords(result.metadata.keywords?.join(', ') || '');
                    setCreator(result.metadata.creator || '');
                    setProducer(result.metadata.producer || '');
                    setPageCount(result.pageCount || 0);
                    setState({ status: 'editing' });
                } else {
                    setState({
                        status: 'error',
                        message: result.error || 'Failed to read PDF metadata'
                    });
                }
            } catch (error) {
                if (!cancelled) {
                    setState({
                        status: 'error',
                        message: error instanceof Error ? error.message : 'Unknown error'
                    });
                }
            }
        };

        loadMetadata();

        return () => {
            cancelled = true;
        };
    }, [file]);

    // Check if metadata has changed
    const hasChanges = () => {
        return (
            title !== (originalMetadata.title || '') ||
            author !== (originalMetadata.author || '') ||
            subject !== (originalMetadata.subject || '') ||
            keywords !== (originalMetadata.keywords?.join(', ') || '') ||
            creator !== (originalMetadata.creator || '') ||
            producer !== (originalMetadata.producer || '')
        );
    };

    // Handle save
    const handleSave = async () => {
        try {
            const result = await editPdfMetadata(file, {
                metadata: {
                    title: title || undefined,
                    author: author || undefined,
                    subject: subject || undefined,
                    keywords: keywords ? keywords.split(',').map(k => k.trim()).filter(k => k) : undefined,
                    creator: creator || undefined,
                    producer: producer || undefined,
                },
                onProgress: (p) => {
                    setState({ status: 'processing', progress: p });
                }
            });

            if (result.success && result.data) {
                setState({
                    status: 'complete',
                    result: {
                        data: result.data,
                        fileName: result.fileName!,
                        pageCount: result.pageCount!,
                    }
                });
            } else {
                setState({
                    status: 'error',
                    message: result.error || 'Failed to update metadata'
                });
            }
        } catch (error) {
            setState({
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to update metadata'
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

    // Format date for display
    const formatDate = (date?: Date) => {
        if (!date) return 'Not set';
        return date.toLocaleString();
    };

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

    // Render loading/processing state
    if (state.status === 'idle' || state.status === 'loading' || state.status === 'processing') {
        const progress = state.status === 'loading' || state.status === 'processing'
            ? state.progress
            : { percent: 0, stage: 'loading' as const, message: 'Initializing...' };
        return <ProcessingStatus progress={progress} fileName={file.name} />;
    }

    // Render success state
    if (state.status === 'complete') {
        return (
            <div className="space-y-6">
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                            <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Metadata Updated!</h3>
                            <p className="text-sm text-muted-foreground">
                                PDF metadata has been saved ({state.result.pageCount} pages)
                            </p>
                        </div>
                    </div>
                </Card>

                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700"
                        onClick={handleDownload}
                    >
                        <Download className="h-4 w-4" />
                        Download PDF
                    </Button>
                    <Button variant="ghost" className="gap-2" onClick={onReset}>
                        <RotateCcw className="h-4 w-4" />
                        Edit Another PDF
                    </Button>
                </div>
            </div>
        );
    }

    // Render editing state
    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                            <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Edit PDF Metadata</h3>
                            <p className="text-sm text-muted-foreground">
                                {file.name} • {formatFileSize(file.size)} • {pageCount} pages
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={handleSave}
                        disabled={!hasChanges()}
                        className="bg-purple-600 hover:bg-purple-700 gap-2"
                    >
                        <Save className="h-4 w-4" />
                        Save Changes
                    </Button>
                </div>
            </Card>

            {/* Metadata Form */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Document Info */}
                <Card className="p-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Document Information
                    </h4>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                placeholder="Document title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                                id="subject"
                                placeholder="Document subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="keywords">Keywords</Label>
                            <Input
                                id="keywords"
                                placeholder="keyword1, keyword2, keyword3"
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Separate with commas</p>
                        </div>
                    </div>
                </Card>

                {/* Author Info */}
                <Card className="p-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Author & Application
                    </h4>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="author">Author</Label>
                            <Input
                                id="author"
                                placeholder="Document author"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="creator">Creator Application</Label>
                            <Input
                                id="creator"
                                placeholder="Application used to create"
                                value={creator}
                                onChange={(e) => setCreator(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="producer">PDF Producer</Label>
                            <Input
                                id="producer"
                                placeholder="PDF library/application"
                                value={producer}
                                onChange={(e) => setProducer(e.target.value)}
                            />
                        </div>
                    </div>
                </Card>

                {/* Read-only Info */}
                <Card className="p-6 md:col-span-2">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Date Information (Read-only)
                    </h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground mb-1">Creation Date</p>
                            <p className="text-sm font-medium">{formatDate(originalMetadata.creationDate)}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-xs text-muted-foreground mb-1">Last Modified</p>
                            <p className="text-sm font-medium">{formatDate(originalMetadata.modificationDate)}</p>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                        Modification date will be updated when you save changes.
                    </p>
                </Card>
            </div>

            {/* Changes indicator */}
            {hasChanges() && (
                <div className="flex justify-center text-muted-foreground text-sm gap-2">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>You have unsaved changes - Click &quot;Save Changes&quot; to apply</span>
                </div>
            )}
        </div>
    );
}
