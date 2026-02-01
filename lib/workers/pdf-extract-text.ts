/**
 * PDF Text Extraction Utilities
 * 
 * Uses pdf.js to extract text content from PDF documents.
 * Preserves text order and can separate by page.
 */

import type { ProgressUpdate } from './types';

export interface PdfExtractTextOptions {
    pageRange?: { start?: number; end?: number };
    separatePages?: boolean;
    onProgress?: (progress: ProgressUpdate) => void;
}

export interface PdfExtractTextResult {
    success: boolean;
    text?: string;
    pageTexts?: string[];
    pageCount?: number;
    wordCount?: number;
    characterCount?: number;
    error?: string;
}

// Lazy load pdf.js only on client side
let pdfjsLib: typeof import('pdfjs-dist') | null = null;

async function getPdfJs() {
    if (typeof window === 'undefined') {
        throw new Error('PDF processing is only available in the browser');
    }

    if (!pdfjsLib) {
        pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    }

    return pdfjsLib;
}

/**
 * Extract text from PDF
 */
export async function extractTextFromPdf(
    file: File,
    options: PdfExtractTextOptions = {}
): Promise<PdfExtractTextResult> {
    const { pageRange, separatePages = false, onProgress } = options;

    try {
        onProgress?.({
            percent: 0,
            stage: 'loading',
            message: 'Loading PDF library...',
        });

        const pdfjs = await getPdfJs();

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

        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const totalPages = pdf.numPages;

        // Determine page range
        const startPage = pageRange?.start ?? 1;
        const endPage = Math.min(pageRange?.end ?? totalPages, totalPages);
        const pagesToProcess = endPage - startPage + 1;

        const pageTexts: string[] = [];
        let allText = '';

        for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
            const progressPercent = 20 + ((pageNum - startPage) / pagesToProcess) * 70;

            onProgress?.({
                percent: Math.round(progressPercent),
                stage: 'processing',
                message: `Extracting text from page ${pageNum} of ${endPage}...`,
            });

            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();

            // Extract text items and join them
            const pageText = textContent.items
                .map((item) => {
                    if ('str' in item) {
                        return item.str;
                    }
                    return '';
                })
                .join(' ')
                .replace(/\s+/g, ' ')
                .trim();

            pageTexts.push(pageText);

            if (allText) {
                allText += '\n\n--- Page ' + pageNum + ' ---\n\n';
            }
            allText += pageText;
        }

        // Calculate statistics
        const wordCount = allText.split(/\s+/).filter(w => w.length > 0).length;
        const characterCount = allText.length;

        onProgress?.({
            percent: 100,
            stage: 'complete',
            message: 'Text extraction complete!',
        });

        return {
            success: true,
            text: allText,
            pageTexts: separatePages ? pageTexts : undefined,
            pageCount: pagesToProcess,
            wordCount,
            characterCount,
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
