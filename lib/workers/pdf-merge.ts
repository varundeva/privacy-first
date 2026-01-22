/**
 * PDF Merge Utilities
 * 
 * Uses pdf-lib to merge multiple PDF files into one.
 * Preserves original quality.
 */

import type { ProgressUpdate } from './types';

export interface PdfMergeOptions {
    /** Ordered list of files to merge */
    files: File[];
    onProgress?: (progress: ProgressUpdate) => void;
}

export interface PdfMergeResult {
    success: boolean;
    data?: ArrayBuffer;
    fileName?: string;
    pageCount?: number;
    error?: string;
}

/**
 * Merge multiple PDFs into a single document
 */
export async function mergePdfs(
    options: PdfMergeOptions
): Promise<PdfMergeResult> {
    const { files, onProgress } = options;

    try {
        onProgress?.({
            percent: 0,
            stage: 'loading',
            message: 'Loading PDF library...',
        });

        // Dynamically import pdf-lib
        const { PDFDocument } = await import('pdf-lib');

        // Create a new document
        const mergedPdf = await PDFDocument.create();
        let totalPages = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const progressBasis = (i / files.length) * 80; // First 80% for processing input files

            onProgress?.({
                percent: Math.round(progressBasis),
                stage: 'processing',
                message: `Processing file ${i + 1} of ${files.length}: ${file.name}...`,
            });

            const arrayBuffer = await file.arrayBuffer();

            // Load the source PDF
            const pdfDoc = await PDFDocument.load(arrayBuffer);
            const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());

            pages.forEach((page) => {
                mergedPdf.addPage(page);
            });

            totalPages += pages.length;
        }

        onProgress?.({
            percent: 85,
            stage: 'encoding',
            message: 'Saving merged PDF...',
        });

        // Save the merged PDF
        const pdfBytes = await mergedPdf.save();

        onProgress?.({
            percent: 100,
            stage: 'complete',
            message: 'Merge complete!',
        });

        // Generate filename based on first file
        const baseName = files[0].name.replace(/\.pdf$/i, '');
        const fileName = `${baseName}_merged.pdf`;

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
