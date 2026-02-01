/**
 * Images to PDF Conversion Utilities
 * 
 * Uses pdf-lib to combine multiple images into a single PDF document.
 * Supports JPG, PNG, and WebP images.
 */

import type { ProgressUpdate } from './types';

export type PageSize = 'a4' | 'letter' | 'original' | 'fit';
export type PageOrientation = 'portrait' | 'landscape' | 'auto';

export interface ImagesToPdfOptions {
    pageSize?: PageSize;
    orientation?: PageOrientation;
    margin?: number;
    imageQuality?: number;
    onProgress?: (progress: ProgressUpdate) => void;
}

export interface ImagesToPdfResult {
    success: boolean;
    data?: ArrayBuffer;
    fileName?: string;
    pageCount?: number;
    error?: string;
}

// Standard page sizes in points (1 point = 1/72 inch)
const PAGE_SIZES = {
    a4: { width: 595.28, height: 841.89 },
    letter: { width: 612, height: 792 },
};

/**
 * Convert multiple images to PDF
 */
export async function imagesToPdf(
    files: File[],
    options: ImagesToPdfOptions = {}
): Promise<ImagesToPdfResult> {
    const {
        pageSize = 'a4',
        orientation = 'auto',
        margin = 20,
        onProgress,
    } = options;

    try {
        if (files.length === 0) {
            throw new Error('No images provided');
        }

        onProgress?.({
            percent: 0,
            stage: 'loading',
            message: 'Loading PDF library...',
        });

        const { PDFDocument } = await import('pdf-lib');

        onProgress?.({
            percent: 5,
            stage: 'processing',
            message: 'Creating PDF document...',
        });

        const pdfDoc = await PDFDocument.create();
        const totalImages = files.length;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const progressPercent = 10 + ((i / totalImages) * 80);

            onProgress?.({
                percent: Math.round(progressPercent),
                stage: 'processing',
                message: `Processing image ${i + 1} of ${totalImages}: ${file.name}`,
            });

            const arrayBuffer = await file.arrayBuffer();
            const mimeType = file.type.toLowerCase();

            let image;

            try {
                if (mimeType === 'image/png') {
                    image = await pdfDoc.embedPng(arrayBuffer);
                } else if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
                    image = await pdfDoc.embedJpg(arrayBuffer);
                } else if (mimeType === 'image/webp') {
                    // WebP needs to be converted to PNG/JPG first via canvas
                    const blob = new Blob([arrayBuffer], { type: mimeType });
                    const bitmap = await createImageBitmap(blob);

                    const canvas = document.createElement('canvas');
                    canvas.width = bitmap.width;
                    canvas.height = bitmap.height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) throw new Error('Could not create canvas context');

                    ctx.drawImage(bitmap, 0, 0);
                    const pngBlob = await new Promise<Blob>((resolve, reject) => {
                        canvas.toBlob(
                            (b) => b ? resolve(b) : reject(new Error('Failed to convert image')),
                            'image/png'
                        );
                    });

                    const pngBuffer = await pngBlob.arrayBuffer();
                    image = await pdfDoc.embedPng(pngBuffer);
                } else {
                    // Try to convert other formats via canvas
                    const blob = new Blob([arrayBuffer], { type: mimeType });
                    const bitmap = await createImageBitmap(blob);

                    const canvas = document.createElement('canvas');
                    canvas.width = bitmap.width;
                    canvas.height = bitmap.height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) throw new Error('Could not create canvas context');

                    ctx.drawImage(bitmap, 0, 0);
                    const jpgBlob = await new Promise<Blob>((resolve, reject) => {
                        canvas.toBlob(
                            (b) => b ? resolve(b) : reject(new Error('Failed to convert image')),
                            'image/jpeg',
                            0.92
                        );
                    });

                    const jpgBuffer = await jpgBlob.arrayBuffer();
                    image = await pdfDoc.embedJpg(jpgBuffer);
                }
            } catch {
                throw new Error(`Failed to process image: ${file.name}. Make sure it's a valid image file.`);
            }

            const imgWidth = image.width;
            const imgHeight = image.height;
            const imgAspect = imgWidth / imgHeight;

            // Determine page dimensions
            let pageWidth: number;
            let pageHeight: number;

            if (pageSize === 'original') {
                // Use image dimensions directly
                pageWidth = imgWidth;
                pageHeight = imgHeight;
            } else if (pageSize === 'fit') {
                // Scale image to fit standard A4, maintaining aspect
                const a4 = PAGE_SIZES.a4;
                if (imgAspect > 1) {
                    // Landscape image
                    pageWidth = a4.height;
                    pageHeight = a4.width;
                } else {
                    // Portrait image
                    pageWidth = a4.width;
                    pageHeight = a4.height;
                }
            } else {
                // Standard page size
                const size = PAGE_SIZES[pageSize] || PAGE_SIZES.a4;

                // Determine orientation
                let isLandscape = false;
                if (orientation === 'landscape') {
                    isLandscape = true;
                } else if (orientation === 'auto') {
                    isLandscape = imgAspect > 1;
                }

                if (isLandscape) {
                    pageWidth = size.height;
                    pageHeight = size.width;
                } else {
                    pageWidth = size.width;
                    pageHeight = size.height;
                }
            }

            const page = pdfDoc.addPage([pageWidth, pageHeight]);

            // Calculate image placement with margins
            const availableWidth = pageWidth - margin * 2;
            const availableHeight = pageHeight - margin * 2;
            const availableAspect = availableWidth / availableHeight;

            let drawWidth: number;
            let drawHeight: number;

            if (pageSize === 'original') {
                // No scaling
                drawWidth = imgWidth;
                drawHeight = imgHeight;
            } else {
                // Scale to fit within margins
                if (imgAspect > availableAspect) {
                    // Image is wider - constrain by width
                    drawWidth = availableWidth;
                    drawHeight = drawWidth / imgAspect;
                } else {
                    // Image is taller - constrain by height
                    drawHeight = availableHeight;
                    drawWidth = drawHeight * imgAspect;
                }
            }

            // Center the image
            const x = (pageWidth - drawWidth) / 2;
            const y = (pageHeight - drawHeight) / 2;

            page.drawImage(image, {
                x,
                y,
                width: drawWidth,
                height: drawHeight,
            });
        }

        onProgress?.({
            percent: 92,
            stage: 'encoding',
            message: 'Saving PDF...',
        });

        const pdfBytes = await pdfDoc.save();

        onProgress?.({
            percent: 100,
            stage: 'complete',
            message: 'PDF created successfully!',
        });

        return {
            success: true,
            data: pdfBytes.buffer as ArrayBuffer,
            fileName: 'images.pdf',
            pageCount: files.length,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

        onProgress?.({
            percent: 0,
            stage: 'error',
            message: errorMessage,
        });

        return {
            success: false,
            error: errorMessage,
        };
    }
}
