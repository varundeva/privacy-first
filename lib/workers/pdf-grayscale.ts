/**
 * PDF Grayscale Conversion Utilities
 * 
 * Uses pdf.js to render pages and canvas to convert to grayscale,
 * then pdf-lib to create a new grayscale PDF.
 */

import type { ProgressUpdate } from './types';

export interface PdfGrayscaleOptions {
    quality?: number;  // 0.0 to 1.0, default 0.92
    dpi?: number;  // Render DPI, default 150
    pageRange?: { start?: number; end?: number };
    onProgress?: (progress: ProgressUpdate) => void;
}

export interface PdfGrayscaleResult {
    success: boolean;
    data?: ArrayBuffer;
    fileName?: string;
    pageCount?: number;
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
 * Convert PDF to grayscale
 */
export async function convertPdfToGrayscale(
    file: File,
    options: PdfGrayscaleOptions = {}
): Promise<PdfGrayscaleResult> {
    const {
        quality = 0.92,
        dpi = 150,
        pageRange,
        onProgress,
    } = options;

    try {
        onProgress?.({
            percent: 0,
            stage: 'loading',
            message: 'Loading libraries...',
        });

        const pdfjs = await getPdfJs();
        const { PDFDocument } = await import('pdf-lib');

        onProgress?.({
            percent: 5,
            stage: 'loading',
            message: 'Reading PDF file...',
        });

        const arrayBuffer = await file.arrayBuffer();

        onProgress?.({
            percent: 10,
            stage: 'processing',
            message: 'Loading PDF document...',
        });

        const pdfSrc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const totalPages = pdfSrc.numPages;

        // Determine page range
        const startPage = pageRange?.start ?? 1;
        const endPage = Math.min(pageRange?.end ?? totalPages, totalPages);
        const pagesToProcess = endPage - startPage + 1;

        // Create new PDF document
        const newPdf = await PDFDocument.create();

        // Scale factor for rendering (DPI / 72 points per inch)
        const scale = dpi / 72;

        for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
            const progressPercent = 15 + ((pageNum - startPage) / pagesToProcess) * 75;

            onProgress?.({
                percent: Math.round(progressPercent),
                stage: 'processing',
                message: `Converting page ${pageNum} to grayscale...`,
            });

            // Get page from source PDF
            const page = await pdfSrc.getPage(pageNum);
            const viewport = page.getViewport({ scale });

            // Create canvas for rendering
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) {
                throw new Error('Could not create canvas context');
            }

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            // Render page to canvas
            await page.render({
                canvasContext: context,
                viewport,
                canvas,
            }).promise;

            // Convert to grayscale
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                // Use luminance formula for natural grayscale
                const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                data[i] = gray;      // R
                data[i + 1] = gray;  // G
                data[i + 2] = gray;  // B
                // Alpha channel (data[i + 3]) unchanged
            }

            context.putImageData(imageData, 0, 0);

            // Convert canvas to JPEG
            const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob(
                    (b) => b ? resolve(b) : reject(new Error('Failed to create blob')),
                    'image/jpeg',
                    quality
                );
            });

            const jpgBuffer = await blob.arrayBuffer();

            // Embed in new PDF
            const jpgImage = await newPdf.embedJpg(jpgBuffer);

            // Add page with original dimensions (in points)
            const origViewport = page.getViewport({ scale: 1 });
            const newPage = newPdf.addPage([origViewport.width, origViewport.height]);

            // Draw image to fill page
            newPage.drawImage(jpgImage, {
                x: 0,
                y: 0,
                width: origViewport.width,
                height: origViewport.height,
            });

            // Cleanup
            canvas.width = 0;
            canvas.height = 0;
        }

        onProgress?.({
            percent: 92,
            stage: 'encoding',
            message: 'Saving grayscale PDF...',
        });

        const pdfBytes = await newPdf.save();
        const baseName = file.name.replace(/\.pdf$/i, '');
        const fileName = `${baseName}_grayscale.pdf`;

        onProgress?.({
            percent: 100,
            stage: 'complete',
            message: 'Grayscale conversion complete!',
        });

        return {
            success: true,
            data: pdfBytes.buffer as ArrayBuffer,
            fileName,
            pageCount: pagesToProcess,
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
