/**
 * PDF Crop Utilities
 * 
 * Uses pdf-lib to crop PDF page margins/borders.
 * Modifies the crop box to remove unwanted margins.
 */

import type { ProgressUpdate } from './types';

export type CropType = 'uniform' | 'individual';

export interface CropMargins {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export interface PdfCropOptions {
    cropType?: CropType;
    margins: CropMargins;  // Pixels/points to remove from each side
    pageRange?: { start?: number; end?: number };
    onProgress?: (progress: ProgressUpdate) => void;
}

export interface PdfCropResult {
    success: boolean;
    data?: ArrayBuffer;
    fileName?: string;
    pageCount?: number;
    error?: string;
}

/**
 * Crop PDF pages
 */
export async function cropPdf(
    file: File,
    options: PdfCropOptions
): Promise<PdfCropResult> {
    const {
        margins,
        pageRange,
        onProgress,
    } = options;

    try {
        onProgress?.({
            percent: 0,
            stage: 'loading',
            message: 'Loading PDF library...',
        });

        const { PDFDocument } = await import('pdf-lib');

        onProgress?.({
            percent: 10,
            stage: 'loading',
            message: 'Reading PDF file...',
        });

        const arrayBuffer = await file.arrayBuffer();

        onProgress?.({
            percent: 20,
            stage: 'processing',
            message: 'Loading PDF document...',
        });

        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = pdfDoc.getPages();
        const totalPages = pages.length;

        // Determine page range
        const startPage = (pageRange?.start ?? 1) - 1;
        const endPage = Math.min((pageRange?.end ?? totalPages) - 1, totalPages - 1);

        // Process each page
        for (let i = startPage; i <= endPage; i++) {
            const progressPercent = 25 + ((i - startPage) / (endPage - startPage + 1)) * 65;

            onProgress?.({
                percent: Math.round(progressPercent),
                stage: 'processing',
                message: `Cropping page ${i + 1}...`,
            });

            const page = pages[i];
            const { width, height } = page.getSize();

            // Calculate new crop box
            // Note: PDF coordinates start from bottom-left
            const newX = margins.left;
            const newY = margins.bottom;
            const newWidth = width - margins.left - margins.right;
            const newHeight = height - margins.top - margins.bottom;

            if (newWidth <= 0 || newHeight <= 0) {
                throw new Error(`Crop margins too large for page ${i + 1}. Page would have no content.`);
            }

            // Set the crop box
            page.setCropBox(newX, newY, newWidth, newHeight);

            // Also set media box to match (optional, but ensures consistent behavior)
            page.setMediaBox(newX, newY, newWidth, newHeight);
        }

        onProgress?.({
            percent: 92,
            stage: 'encoding',
            message: 'Saving cropped PDF...',
        });

        const pdfBytes = await pdfDoc.save();
        const baseName = file.name.replace(/\.pdf$/i, '');
        const fileName = `${baseName}_cropped.pdf`;

        onProgress?.({
            percent: 100,
            stage: 'complete',
            message: 'PDF cropped successfully!',
        });

        return {
            success: true,
            data: pdfBytes.buffer as ArrayBuffer,
            fileName,
            pageCount: totalPages,
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
