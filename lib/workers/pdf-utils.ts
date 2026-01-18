/**
 * PDF Utility Functions
 * 
 * Uses pdf.js to render PDF pages to canvas/images.
 * Note: pdf.js runs on the main thread but processing is fast enough
 * for typical use cases. For very large PDFs, consider chunked processing.
 * 
 * IMPORTANT: pdf.js uses browser-only APIs (DOMMatrix, etc.) so it must
 * only be imported on the client side using dynamic imports.
 */

import type {
    PdfToImagesResult,
    PdfPageImage,
    ProgressUpdate,
    PdfMetadata
} from './types';

export interface PdfToImagesOptions {
    outputFormat?: 'png' | 'jpeg';
    quality?: number;
    scale?: number;
    pageRange?: { start?: number; end?: number };
    onProgress?: (progress: ProgressUpdate) => void;
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
 * Convert PDF pages to images
 */
export async function convertPdfToImages(
    file: File,
    options: PdfToImagesOptions = {}
): Promise<PdfToImagesResult> {
    const {
        outputFormat = 'png',
        quality = 0.92,
        scale = 2, // 2x scale for good quality (144 DPI)
        pageRange,
        onProgress,
    } = options;

    try {
        // Report loading progress
        onProgress?.({
            percent: 0,
            stage: 'loading',
            message: 'Loading PDF file...',
        });

        // Dynamically load pdf.js
        const pdfjs = await getPdfJs();

        // Read file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();

        // Load PDF document
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const totalPages = pdf.numPages;

        // Determine page range
        const startPage = pageRange?.start ?? 1;
        const endPage = Math.min(pageRange?.end ?? totalPages, totalPages);
        const pagesToProcess = endPage - startPage + 1;

        onProgress?.({
            percent: 10,
            stage: 'processing',
            message: `Processing ${pagesToProcess} page${pagesToProcess > 1 ? 's' : ''}...`,
        });

        const pages: PdfPageImage[] = [];
        const baseName = file.name.replace(/\.pdf$/i, '');

        for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
            const pageIndex = pageNum - startPage;
            const progressPercent = 10 + ((pageIndex / pagesToProcess) * 80);

            onProgress?.({
                percent: Math.round(progressPercent),
                stage: 'processing',
                message: `Rendering page ${pageNum} of ${endPage}...`,
            });

            // Get page
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({ scale });

            // Create canvas
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

            // Convert canvas to blob
            const mimeType = outputFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
            const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob(
                    (b) => {
                        if (b) resolve(b);
                        else reject(new Error('Failed to create blob'));
                    },
                    mimeType,
                    outputFormat === 'jpeg' ? quality : undefined
                );
            });

            // Convert blob to ArrayBuffer
            const data = await blob.arrayBuffer();
            const extension = outputFormat === 'jpeg' ? 'jpg' : 'png';
            const fileName = pagesToProcess > 1
                ? `${baseName}_page_${pageNum}.${extension}`
                : `${baseName}.${extension}`;

            pages.push({
                pageNumber: pageNum,
                data,
                width: viewport.width,
                height: viewport.height,
                fileName,
            });

            // Clear canvas
            canvas.width = 0;
            canvas.height = 0;
        }

        onProgress?.({
            percent: 100,
            stage: 'complete',
            message: 'Conversion complete!',
        });

        return {
            success: true,
            pages,
            totalPages,
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

/**
 * Get PDF metadata without fully processing
 */
export async function getPdfMetadata(file: File): Promise<PdfMetadata | null> {
    try {
        const pdfjs = await getPdfJs();
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const metadata = await pdf.getMetadata();

        return {
            title: (metadata.info as Record<string, unknown>)?.['Title'] as string | undefined,
            author: (metadata.info as Record<string, unknown>)?.['Author'] as string | undefined,
            pageCount: pdf.numPages,
            fileName: file.name,
            fileSize: formatFileSize(file.size),
            fileSizeBytes: file.size,
        };
    } catch {
        return null;
    }
}

/**
 * Helper to format file size
 */
function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Download multiple images as a zip file
 */
export async function downloadImagesAsZip(
    pages: PdfPageImage[],
    zipFileName: string
): Promise<void> {
    // For single page, download directly
    if (pages.length === 1) {
        const page = pages[0];
        const blob = new Blob([page.data], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = page.fileName;
        a.click();
        URL.revokeObjectURL(url);
        return;
    }

    // For multiple pages, we'd typically use JSZip
    // For now, download each file individually
    for (const page of pages) {
        const blob = new Blob([page.data], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = page.fileName;
        a.click();
        URL.revokeObjectURL(url);

        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}
