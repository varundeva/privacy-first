'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    AlertCircle,
    RotateCcw,
    Download,
    Check,
    FileText,
    GripVertical,
    X,
    Plus,
    Files
} from 'lucide-react';
import { ProcessingStatus } from '../shared/ProcessingStatus';
import { mergePdfs } from '@/lib/workers/pdf-merge';
import { convertPdfToImages } from '@/lib/workers/pdf-utils';
import { formatFileSize, type ProgressUpdate } from '@/lib/workers/types';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface PdfMergerProps {
    file: File; // Initial file (from router/shell)
    onReset: () => void;
}

type MergeState =
    | { status: 'idle' }
    | { status: 'processing'; progress: ProgressUpdate }
    | { status: 'complete'; result: { data: ArrayBuffer; fileName: string; pageCount: number } }
    | { status: 'error'; message: string };

interface FileItem {
    id: string;
    file: File;
    thumbnail?: string;
}

// Sortable Item Component
function SortableFileItem({
    item,
    onRemove
}: {
    item: FileItem;
    onRemove: (id: string) => void
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group relative flex flex-col gap-2 rounded-xl border bg-background p-3 shadow-sm transition-all hover:shadow-md touch-none"
        >
            <div className="absolute top-2 right-2 z-30 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onRemove(item.id);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-full bg-background/90 hover:bg-destructive/10 hover:text-destructive text-muted-foreground backdrop-blur-sm border shadow-sm cursor-pointer"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Thumbnail */}
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-muted border">
                {item.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={item.thumbnail}
                        alt="Preview"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <FileText className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                )}

                {/* Drag Handle Overlay */}
                <div
                    {...attributes}
                    {...listeners}
                    className="absolute inset-0 z-20 cursor-grab active:cursor-grabbing hover:bg-black/5 transition-colors"
                />
            </div>

            {/* Info */}
            <div className="flex items-start gap-2 min-w-0">
                <div
                    {...attributes}
                    {...listeners}
                    className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-foreground transition-colors"
                >
                    <GripVertical className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(item.file.size)}</p>
                </div>
            </div>
        </div>
    );
}

export function PdfMerger({ file: initialFile, onReset }: PdfMergerProps) {
    const [state, setState] = useState<MergeState>({ status: 'idle' });
    const [files, setFiles] = useState<FileItem[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const initialized = useRef(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Initialize with the first file - Only once
    useEffect(() => {
        if (!initialized.current && initialFile) {
            initialized.current = true;
            addFile(initialFile);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialFile]);

    async function addFile(file: File) {
        const id = Math.random().toString(36).substring(7);
        const newItem: FileItem = { id, file };

        // Optimistic update
        setFiles(prev => [...prev, newItem]);

        // Generate thumbnail
        try {
            const result = await convertPdfToImages(file, {
                scale: 0.5,
                pageRange: { start: 1, end: 1 },
                outputFormat: 'jpeg'
            });

            if (result.success && result.pages && result.pages.length > 0) {
                const blob = new Blob([result.pages[0].data], { type: 'image/jpeg' });
                const url = URL.createObjectURL(blob);

                setFiles(prev => prev.map(f =>
                    f.id === id ? { ...f, thumbnail: url } : f
                ));
            }
        } catch (e) {
            console.error("Failed to generate thumbnail for", file.name, e);
        }
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            Array.from(e.target.files).forEach(addFile);
        }
        // Reset input
        e.target.value = '';
    };

    const handleRemove = (id: string) => {
        setFiles(prev => {
            const file = prev.find(f => f.id === id);
            if (file?.thumbnail) URL.revokeObjectURL(file.thumbnail);
            return prev.filter(f => f.id !== id);
        });
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setFiles((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
        setActiveId(null);
    };

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    const handleMerge = async () => {
        try {
            if (files.length < 2) return;

            setState({
                status: 'processing',
                progress: { percent: 0, stage: 'processing', message: 'Starting merge...' }
            });

            const result = await mergePdfs({
                files: files.map(f => f.file),
                onProgress: (p) => setState({ status: 'processing', progress: p })
            });

            if (result.success && result.data) {
                setState({
                    status: 'complete',
                    result: {
                        data: result.data,
                        fileName: result.fileName || 'merged.pdf',
                        pageCount: result.pageCount || 0
                    }
                });
            } else {
                setState({
                    status: 'error',
                    message: result.error || 'Failed to merge PDFs'
                });
            }

        } catch (error) {
            setState({
                status: 'error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

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

    // Render processing state
    if (state.status === 'processing') {
        return <ProcessingStatus progress={state.progress} fileName="Merging files..." />;
    }

    // Render success state
    if (state.status === 'complete') {
        return (
            <div className="space-y-6">
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                            <Check className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Merge Complete!</h3>
                            <p className="text-sm text-muted-foreground">
                                Combined {files.length} PDFs into one document ({state.result.pageCount} pages)
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
                        Download Merged PDF
                    </Button>
                    <Button variant="ghost" className="gap-2" onClick={onReset}>
                        <RotateCcw className="h-4 w-4" />
                        Merge Another PDF
                    </Button>
                </div>
            </div>
        );
    }

    // Render Error state
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

    const activeItem = activeId ? files.find(f => f.id === activeId) : null;

    return (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Files className="h-5 w-5" />
                                Arranged Files
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Drag and drop items to reorder. The order determines the merged PDF sequence.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    multiple
                                    className="absolute inset-0 cursor-pointer opacity-0"
                                    onChange={handleFileUpload}
                                />
                                <Button variant="outline" className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add PDF
                                </Button>
                            </div>
                            <Button
                                onClick={handleMerge}
                                disabled={files.length < 2}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                Merge PDFs {files.length > 0 && `(${files.length})`}
                            </Button>
                        </div>
                    </div>

                    {/* Sortable List */}
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={files.map(f => f.id)}
                            strategy={rectSortingStrategy}
                        >
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {files.map((item) => (
                                    <SortableFileItem
                                        key={item.id}
                                        item={item}
                                        onRemove={handleRemove}
                                    />
                                ))}

                                {/* Empty Add Button placeholder if list is small */}
                                {files.length === 0 && (
                                    <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed rounded-xl text-muted-foreground bg-muted/20">
                                        <p>No files selected</p>
                                    </div>
                                )}
                            </div>
                        </SortableContext>

                        {/* Drag Overlay */}
                        <DragOverlay>
                            {activeItem ? (
                                <div className="flex flex-col gap-2 rounded-xl border bg-background p-3 shadow-xl opacity-90 cursor-grabbing">
                                    <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-muted border">
                                        {activeItem.thumbnail ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={activeItem.thumbnail} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center">
                                                <FileText className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </div>
            </Card>

            {files.length > 1 && (
                <div className="flex justify-center text-muted-foreground text-sm gap-2">
                    <Check className="h-4 w-4" />
                    <span>Ready to merge {files.length} files</span>
                </div>
            )}
        </div>
    );
}
