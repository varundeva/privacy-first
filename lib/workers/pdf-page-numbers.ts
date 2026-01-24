/**
 * PDF Page Numbers Utilities
 * 
 * Uses pdf-lib to add page numbers to PDF documents.
 * Supports various positions and formatting options.
 */

import type { ProgressUpdate } from './types';

export type PageNumberPosition =
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'
    | 'top-left'
    | 'top-center'
    | 'top-right';

export type PageNumberFormat = 'number' | 'page-n' | 'n-of-total' | 'page-n-of-total';

export interface PdfPageNumbersOptions {
    /** Position of page numbers */
    position: PageNumberPosition;
    /** Format of page numbers */
    format: PageNumberFormat;
    /** Font size in points */
    fontSize: number;
    /** Starting page number */
    startNumber: number;
    /** Pages to skip (0-based indices) */
    skipPages?: number[];
    /** Margin from edge in points */
    margin: number;
    onProgress?: (progress: ProgressUpdate) => void;
}

export interface PdfPageNumbersResult {
    success: boolean;
    data?: ArrayBuffer;
    fileName?: string;
    pageCount?: number;
    error?: string;
}

/**
 * Format a page number based on the selected format
 */
function formatPageNumber(
    pageNum: number,
    totalPages: number,
    format: PageNumberFormat
): string {
    switch (format) {
        case 'number':
            return String(pageNum);
        case 'page-n':
            return `Page ${pageNum}`;
        case 'n-of-total':
            return `${pageNum} of ${totalPages}`;
        case 'page-n-of-total':
            return `Page ${pageNum} of ${totalPages}`;
        default:
            return String(pageNum);
    }
}

/**
 * Add page numbers to a PDF
 */
export async function addPageNumbers(
    file: File,
    options: PdfPageNumbersOptions
): Promise<PdfPageNumbersResult> {
    const {
        position,
        format,
        fontSize,
        startNumber,
        skipPages = [],
        margin,
        onProgress
    } = options;

    try {
        onProgress?.({
            percent: 0,
            stage: 'loading',
            message: 'Loading PDF library...',
        });

        // Dynamically import pdf-lib
        const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');

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

        // Load document
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = pdfDoc.getPages();
        const totalPages = pages.length;

        // Embed font
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        onProgress?.({
            percent: 30,
            stage: 'processing',
            message: `Adding page numbers to ${totalPages} pages...`,
        });

        // Calculate page numbers considering skipped pages
        let currentNumber = startNumber;

        for (let i = 0; i < totalPages; i++) {
            // Skip if page is in skip list
            if (skipPages.includes(i)) {
                continue;
            }

            const page = pages[i];
            const { width, height } = page.getSize();

            // Format the page number text
            const text = formatPageNumber(currentNumber, totalPages, format);
            const textWidth = font.widthOfTextAtSize(text, fontSize);
            const textHeight = fontSize;

            // Calculate position
            let x: number;
            let y: number;

            // Horizontal position
            switch (position) {
                case 'bottom-left':
                case 'top-left':
                    x = margin;
                    break;
                case 'bottom-center':
                case 'top-center':
                    x = (width - textWidth) / 2;
                    break;
                case 'bottom-right':
                case 'top-right':
                    x = width - textWidth - margin;
                    break;
                default:
                    x = (width - textWidth) / 2;
            }

            // Vertical position
            switch (position) {
                case 'bottom-left':
                case 'bottom-center':
                case 'bottom-right':
                    y = margin;
                    break;
                case 'top-left':
                case 'top-center':
                case 'top-right':
                    y = height - margin - textHeight;
                    break;
                default:
                    y = margin;
            }

            // Draw the page number
            page.drawText(text, {
                x,
                y,
                size: fontSize,
                font,
                color: rgb(0, 0, 0), // Black color
            });

            currentNumber++;

            onProgress?.({
                percent: 30 + Math.round((i / totalPages) * 50),
                stage: 'processing',
                message: `Added number to page ${i + 1}...`,
            });
        }

        onProgress?.({
            percent: 85,
            stage: 'encoding',
            message: 'Saving PDF...',
        });

        // Save the modified PDF
        const pdfBytes = await pdfDoc.save();

        // Generate filename
        const baseName = file.name.replace(/\.pdf$/i, '');
        const fileName = `${baseName}_numbered.pdf`;

        onProgress?.({
            percent: 100,
            stage: 'complete',
            message: 'Page numbers added!',
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
