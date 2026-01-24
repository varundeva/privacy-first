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
    Trash2,
    Layers,
    RotateCw,
    Undo2,
} from 'lucide-react';
import { ProcessingStatus } from '../shared/ProcessingStatus';
import { convertPdfToImages } from '@/lib/workers/pdf-utils';
import { formatFileSize, type ProgressUpdate } from '@/lib/workers/types';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
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

interface PdfOrganizerProps {
    file: File;
    onReset: () => void;
}

type OrganizeState =
    | { status: 'idle' }
    | { status: 'loading-previews'; progress: ProgressUpdate }
    | { status: 'organizing' }
    | { status: 'processing'; progress: ProgressUpdate }
    | { status: 'complete'; result: { data: ArrayBuffer; fileName: string; pageCount: number } }
    | { status: 'error'; message: string };

interface PageItem {
    id: string;
    pageNumber: number; // Original page number (1-indexed)
    thumbnail: string;
    rotation: number; // 0, 90, 180, 270
}

// Sortable Page Component
function SortablePage({
    item,
    index,
    isSelected,
    onSelect,
    onRotate,
    onDelete,
}: {
    item: PageItem;
    index: number;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onRotate: (id: string) => void;
    onDelete: (id: string) => void;
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
            className={`group relative flex flex-col gap-2 rounded-xl border-2 bg-background p-2 shadow-sm transition-all hover:shadow-md touch-none ${isSelected
                ? 'border-purple-600 ring-2 ring-purple-600/20 shadow-lg'
                : 'border-transparent hover:border-purple-200 dark:hover:border-purple-800'
                }`}
        >
            {/* Page Number Badge */}
            <div className="absolute top-1 left-1 z-30">
                <span className="px-1.5 py-0.5 text-xs font-semibold bg-background/90 backdrop-blur-sm rounded border shadow-sm">
                    {index + 1}
                </span>
            </div>

            {/* Original Page Badge */}
            {item.pageNumber !== index + 1 && (
                <div className="absolute top-1 right-1 z-30">
                    <span className="px-1.5 py-0.5 text-[10px] text-muted-foreground bg-background/90 backdrop-blur-sm rounded border">
                        was {item.pageNumber}
                    </span>
                </div>
            )}

            {/* Action Buttons - Always visible on mobile, hover on desktop */}
            <div className="absolute bottom-16 sm:bottom-14 left-1/2 -translate-x-1/2 z-30 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex gap-1 bg-background/95 backdrop-blur-sm rounded-lg border p-1.5 sm:p-1 shadow-lg">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRotate(item.id);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="p-2 sm:p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                    title="Rotate 90°"
                >
                    <RotateCw className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="p-2 sm:p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer transition-colors"
                    title="Delete page"
                >
                    <Trash2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                </button>
            </div>

            {/* Thumbnail Container */}
            <div
                className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-muted border cursor-pointer"
                onClick={() => onSelect(item.id)}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={item.thumbnail}
                    alt={`Page ${item.pageNumber}`}
                    className="h-full w-full object-cover transition-transform duration-200"
                    style={{ transform: `rotate(${item.rotation}deg)` }}
                />

                {/* Drag Handle Overlay - entire thumbnail is draggable */}
                <div
                    {...attributes}
                    {...listeners}
                    className="absolute inset-0 z-20 cursor-grab active:cursor-grabbing hover:bg-black/5 transition-colors"
                />

                {/* Selection Overlay */}
                {isSelected && (
                    <div className="absolute inset-0 bg-purple-600/10 pointer-events-none z-10">
                        <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full p-0.5 shadow-sm">
                            <Check className="h-3 w-3" />
                        </div>
                    </div>
                )}
            </div>

            {/* Page Info Footer */}
            <div className="flex items-center gap-1 min-w-0 px-1">
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-foreground transition-colors"
                >
                    <GripVertical className="h-4 w-4" />
                </div>
                <p className="truncate text-xs text-muted-foreground">
                    Page {item.pageNumber}
                    {item.rotation > 0 && ` • ${item.rotation}°`}
                </p>
            </div>
        </div>
    );
}

export function PdfOrganizer({ file, onReset }: PdfOrganizerProps) {
    const [state, setState] = useState<OrganizeState>({ status: 'idle' });
    const [pages, setPages] = useState<PageItem[]>([]);
    const [originalPages, setOriginalPages] = useState<PageItem[]>([]);
    const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 200,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Cleanup thumbnails on unmount
    useEffect(() => {
        return () => {
            pages.forEach((p) => URL.revokeObjectURL(p.thumbnail));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Load PDF thumbnails on mount
    useEffect(() => {
        let cancelled = false;

        const loadThumbnails = async () => {
            try {
                setState({
                    status: 'loading-previews',
                    progress: { percent: 0, stage: 'loading', message: 'Loading PDF for preview...' },
                });

                // Use low scale for fast thumbnail generation
                const result = await convertPdfToImages(file, {
                    scale: 0.5,
                    outputFormat: 'jpeg',
                    quality: 0.6,
                    onProgress: (p) => {
                        if (!cancelled) {
                            setState({ status: 'loading-previews', progress: p });
                        }
                    },
                });

                if (cancelled) return;

                if (result.success && result.pages) {
                    const pageItems: PageItem[] = result.pages.map((p, i) => {
                        const blob = new Blob([p.data], { type: 'image/jpeg' });
                        const url = URL.createObjectURL(blob);
                        return {
                            id: `page-${i + 1}`,
                            pageNumber: i + 1,
                            thumbnail: url,
                            rotation: 0,
                        };
                    });

                    setPages(pageItems);
                    setOriginalPages(JSON.parse(JSON.stringify(pageItems.map(p => ({ ...p })))));
                    setState({ status: 'organizing' });
                } else {
                    setState({
                        status: 'error',
                        message: result.error || 'Failed to load PDF previews',
                    });
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

        loadThumbnails();

        return () => {
            cancelled = true;
        };
    }, [file]);

    // Handle page selection toggle
    const toggleSelection = useCallback((id: string) => {
        setSelectedPages((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    // Handle page rotation
    const rotatePage = useCallback((id: string) => {
        setPages((prev) =>
            prev.map((p) =>
                p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p
            )
        );
    }, []);

    // Handle page deletion
    const deletePage = useCallback((id: string) => {
        setPages((prev) => prev.filter((p) => p.id !== id));
        setSelectedPages((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    }, []);

    // Delete selected pages
    const deleteSelected = useCallback(() => {
        if (selectedPages.size === 0) return;
        setPages((prev) => prev.filter((p) => !selectedPages.has(p.id)));
        setSelectedPages(new Set());
    }, [selectedPages]);

    // Reset to original order
    const resetPages = useCallback(() => {
        // Restore original thumbnails (they share same URLs)
        setPages(originalPages.map(p => ({ ...p, rotation: 0 })));
        setSelectedPages(new Set());
    }, [originalPages]);

    // Check if order has changed
    const hasChanges = (): boolean => {
        if (pages.length !== originalPages.length) return true;
        for (let i = 0; i < pages.length; i++) {
            if (pages[i].pageNumber !== i + 1 || pages[i].rotation !== 0) {
                return true;
            }
        }
        return false;
    };

    // Handle drag events
    const handleDragStart = (event: any) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setPages((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
        setActiveId(null);
    };

    // Handle PDF reorganization
    const handleOrganize = async () => {
        try {
            setState({
                status: 'processing',
                progress: { percent: 0, stage: 'processing', message: 'Reorganizing pages...' },
            });

            // Dynamically import pdf-lib
            const { PDFDocument, degrees } = await import('pdf-lib');

            setState({
                status: 'processing',
                progress: { percent: 10, stage: 'loading', message: 'Reading PDF...' },
            });

            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer);

            setState({
                status: 'processing',
                progress: { percent: 30, stage: 'processing', message: 'Creating new document...' },
            });

            // Create new PDF with reordered pages
            const newPdf = await PDFDocument.create();

            // Get page indices (0-based) in the new order
            const pageIndices = pages.map((p) => p.pageNumber - 1);

            // Copy pages in new order
            const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);

            for (let i = 0; i < copiedPages.length; i++) {
                const page = copiedPages[i];
                const rotation = pages[i].rotation;

                // Apply rotation if needed
                if (rotation > 0) {
                    const currentRotation = page.getRotation().angle;
                    page.setRotation(degrees(currentRotation + rotation));
                }

                newPdf.addPage(page);

                setState({
                    status: 'processing',
                    progress: {
                        percent: 30 + Math.round((i / copiedPages.length) * 50),
                        stage: 'processing',
                        message: `Processing page ${i + 1} of ${copiedPages.length}...`,
                    },
                });
            }

            setState({
                status: 'processing',
                progress: { percent: 90, stage: 'encoding', message: 'Saving PDF...' },
            });

            const pdfBytes = await newPdf.save();

            // Generate filename
            const baseName = file.name.replace(/\.pdf$/i, '');
            const fileName = `${baseName}_organized.pdf`;

            setState({
                status: 'complete',
                result: {
                    data: pdfBytes.buffer as ArrayBuffer,
                    fileName,
                    pageCount: pages.length,
                },
            });
        } catch (error) {
            setState({
                status: 'error',
                message: error instanceof Error ? error.message : 'Unknown error occurred',
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
    if (state.status === 'loading-previews' || state.status === 'processing') {
        return <ProcessingStatus progress={state.progress} fileName={file.name} />;
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
                            <h3 className="font-semibold">PDF Organized!</h3>
                            <p className="text-sm text-muted-foreground">
                                Your PDF has been reorganized with {state.result.pageCount} pages
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
                        Download Organized PDF
                    </Button>
                    <Button variant="ghost" className="gap-2" onClick={onReset}>
                        <RotateCcw className="h-4 w-4" />
                        Organize Another PDF
                    </Button>
                </div>
            </div>
        );
    }

    // Render organizing state
    const activeItem = activeId ? pages.find((p) => p.id === activeId) : null;

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <Card className="p-6">
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Layers className="h-5 w-5" />
                                Organize Pages
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {file.name} • {formatFileSize(file.size)} • {pages.length} pages
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {selectedPages.size > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5 text-destructive hover:text-destructive"
                                    onClick={deleteSelected}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete ({selectedPages.size})
                                </Button>
                            )}
                            {hasChanges() && (
                                <Button variant="outline" size="sm" className="gap-1.5" onClick={resetPages}>
                                    <Undo2 className="h-3.5 w-3.5" />
                                    Reset
                                </Button>
                            )}
                            <Button
                                onClick={handleOrganize}
                                disabled={pages.length === 0}
                                className="bg-purple-600 hover:bg-purple-700 gap-2"
                            >
                                <Check className="h-4 w-4" />
                                Save Changes
                            </Button>
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        💡 Drag pages to reorder • Click to select • Tap rotate/delete buttons on each page
                    </p>
                </div>
            </Card>

            {/* Page Grid */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={pages.map((p) => p.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {pages.map((item, index) => (
                            <SortablePage
                                key={item.id}
                                item={item}
                                index={index}
                                isSelected={selectedPages.has(item.id)}
                                onSelect={toggleSelection}
                                onRotate={rotatePage}
                                onDelete={deletePage}
                            />
                        ))}

                        {pages.length === 0 && (
                            <div className="col-span-full py-16 flex flex-col items-center justify-center border-2 border-dashed rounded-xl text-muted-foreground bg-muted/20">
                                <FileText className="h-12 w-12 mb-4 text-muted-foreground/30" />
                                <p className="font-medium">No pages remaining</p>
                                <p className="text-sm">All pages have been deleted</p>
                                <Button variant="outline" className="mt-4" onClick={resetPages}>
                                    Restore Pages
                                </Button>
                            </div>
                        )}
                    </div>
                </SortableContext>

                {/* Drag Overlay */}
                <DragOverlay>
                    {activeItem ? (
                        <div className="flex flex-col gap-2 rounded-xl border-2 border-purple-600 bg-background p-2 shadow-xl opacity-95 cursor-grabbing">
                            <div className="aspect-[3/4] w-24 overflow-hidden rounded-lg bg-muted border">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={activeItem.thumbnail}
                                    alt=""
                                    className="h-full w-full object-cover"
                                    style={{ transform: `rotate(${activeItem.rotation}deg)` }}
                                />
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Footer Info */}
            {pages.length > 0 && hasChanges() && (
                <div className="flex justify-center text-muted-foreground text-sm gap-2">
                    <Check className="h-4 w-4 text-purple-600" />
                    <span>Changes detected - Click &quot;Save Changes&quot; to create your reorganized PDF</span>
                </div>
            )}
        </div>
    );
}
