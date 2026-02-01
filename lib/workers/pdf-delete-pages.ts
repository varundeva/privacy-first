/**
 * PDF Delete Pages Utilities
 * 
 * Uses pdf-lib to remove specific pages from a PDF.
 * Preserves quality of remaining pages.
 */

import type { ProgressUpdate } from './types';

export interface PdfDeletePagesOptions {
    /** Page numbers to delete (1-based) */
    pagesToDelete: number[];
    onProgress?: (progress: ProgressUpdate) => void;
}

export interface PdfDeletePagesResult {
    success: boolean;
    data?: ArrayBuffer;
    fileName?: string;
    originalPageCount?: number;
    newPageCount?: number;
    deletedCount?: number;
    error?: string;
}

/**
 * Delete specified pages from PDF
 */
export async function deletePdfPages(
    file: File,
    options: PdfDeletePagesOptions
): Promise<PdfDeletePagesResult> {
    const { pagesToDelete, onProgress } = options;

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
        const originalPageCount = pdfDoc.getPageCount();

        // Convert to 0-based indices and sort in descending order
        // (delete from end to avoid index shifting issues)
        const indicesToDelete = pagesToDelete
            .map(p => p - 1)
            .filter(i => i >= 0 && i < originalPageCount)
            .sort((a, b) => b - a);

        if (indicesToDelete.length === 0) {
            throw new Error('No valid pages selected for deletion');
        }

        if (indicesToDelete.length >= originalPageCount) {
            throw new Error('Cannot delete all pages from PDF');
        }

        onProgress?.({
            percent: 40,
            stage: 'processing',
            message: `Removing ${indicesToDelete.length} page(s)...`,
        });

        // Remove pages from end to start
        for (let i = 0; i < indicesToDelete.length; i++) {
            const pageIndex = indicesToDelete[i];
            pdfDoc.removePage(pageIndex);

            onProgress?.({
                percent: 40 + ((i + 1) / indicesToDelete.length) * 40,
                stage: 'processing',
                message: `Removed page ${pageIndex + 1}...`,
            });
        }

        onProgress?.({
            percent: 85,
            stage: 'encoding',
            message: 'Saving modified PDF...',
        });

        const pdfBytes = await pdfDoc.save();
        const newPageCount = pdfDoc.getPageCount();

        const baseName = file.name.replace(/\.pdf$/i, '');
        const fileName = `${baseName}_modified.pdf`;

        onProgress?.({
            percent: 100,
            stage: 'complete',
            message: `Deleted ${indicesToDelete.length} page(s) successfully!`,
        });

        return {
            success: true,
            data: pdfBytes.buffer as ArrayBuffer,
            fileName,
            originalPageCount,
            newPageCount,
            deletedCount: indicesToDelete.length,
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
