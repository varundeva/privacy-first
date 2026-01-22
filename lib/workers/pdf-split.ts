/**
 * PDF Splitter Utilities
 * 
 * Uses pdf-lib to split/extract pages from a PDF.
 * This operation preserves the exact quality of the original pages.
 */

import type { ProgressUpdate } from './types';

export interface PdfSplitOptions {
    /** Page ranges to extract (e.g., "1,3,5-7") */
    pageRanges: string;
    onProgress?: (progress: ProgressUpdate) => void;
}

export interface PdfSplitResult {
    success: boolean;
    data?: ArrayBuffer;
    fileName?: string;
    pageCount?: number;
    error?: string;
}

/**
 * Parse page range string into an array of 0-based page indices
 * Example: "1, 3-5" -> [0, 2, 3, 4]
 */
export function parsePageRanges(input: string, maxPages: number): number[] {
    const pages = new Set<number>();
    const parts = input.split(',').map(p => p.trim());

    for (const part of parts) {
        if (part.includes('-')) {
            // Range: "3-5"
            const [startStr, endStr] = part.split('-');
            const start = parseInt(startStr);
            const end = parseInt(endStr);

            if (!isNaN(start) && !isNaN(end)) {
                // Handle reverse ranges too: "5-3" -> 3,4,5
                const min = Math.min(start, end);
                const max = Math.max(start, end);

                for (let i = min; i <= max; i++) {
                    if (i >= 1 && i <= maxPages) {
                        pages.add(i - 1); // Convert to 0-based
                    }
                }
            }
        } else {
            // Single page: "3"
            const page = parseInt(part);
            if (!isNaN(page) && page >= 1 && page <= maxPages) {
                pages.add(page - 1); // Convert to 0-based
            }
        }
    }

    return Array.from(pages).sort((a, b) => a - b);
}

/**
 * Split PDF based on selected pages
 */
export async function splitPdf(
    file: File,
    options: PdfSplitOptions
): Promise<PdfSplitResult> {
    const { pageRanges, onProgress } = options;

    try {
        onProgress?.({
            percent: 0,
            stage: 'loading',
            message: 'Loading PDF library...',
        });

        // Dynamically import pdf-lib
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

        // Load original document
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const totalPages = pdfDoc.getPageCount();

        // Parse requested pages
        const pageIndices = parsePageRanges(pageRanges, totalPages);

        if (pageIndices.length === 0) {
            throw new Error('No valid pages selected');
        }

        onProgress?.({
            percent: 30,
            stage: 'processing',
            message: `Extracting ${pageIndices.length} pages...`,
        });

        // Create new document
        const newPdf = await PDFDocument.create();

        // Copy pages (indices must be 0-based)
        const copiedPages = await newPdf.copyPages(pdfDoc, pageIndices);

        for (let i = 0; i < copiedPages.length; i++) {
            onProgress?.({
                percent: 30 + Math.round((i / copiedPages.length) * 40),
                stage: 'processing',
                message: `Adding page ${pageIndices[i] + 1}...`,
            });
            newPdf.addPage(copiedPages[i]);
        }

        onProgress?.({
            percent: 80,
            stage: 'encoding',
            message: 'Saving new PDF...',
        });

        // Save with no compression (preserves quality)
        const pdfBytes = await newPdf.save();

        // Generate filename
        const baseName = file.name.replace(/\.pdf$/i, '');
        const fileName = `${baseName}_split.pdf`;

        onProgress?.({
            percent: 100,
            stage: 'complete',
            message: 'Split complete!',
        });

        return {
            success: true,
            data: pdfBytes.buffer as ArrayBuffer,
            fileName,
            pageCount: pageIndices.length,
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
