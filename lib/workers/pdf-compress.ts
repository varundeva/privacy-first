/**
 * PDF Compression Utilities
 * 
 * Compresses PDFs by:
 * 1. Rendering each page as a JPEG image at reduced quality
 * 2. Rebuilding the PDF from those compressed images
 * 
 * This approach achieves significant compression (similar to online compressors)
 * by reducing image quality throughout the document.
 * 
 * All processing happens in the browser for maximum privacy.
 */

import type { ProgressUpdate } from './types';

export type CompressionPreset = 'extreme' | 'high' | 'standard' | 'medium' | 'low';

export interface PdfCompressionOptions {
    preset: CompressionPreset;
    onProgress?: (progress: ProgressUpdate) => void;
}

export interface PdfCompressionResult {
    success: boolean;
    data?: ArrayBuffer;
    fileName?: string;
    originalSize?: number;
    compressedSize?: number;
    compressionRatio?: number;
    error?: string;
}

interface PresetSettings {
    /** JPEG quality for rendered pages (0-1) */
    imageQuality: number;
    /** DPI scale factor (1 = 72 DPI, 1.5 = 108 DPI, 2 = 144 DPI) */
    scale: number;
    /** Whether to remove metadata */
    removeMetadata: boolean;
}

const presetSettings: Record<CompressionPreset, PresetSettings> = {
    extreme: {
        imageQuality: 0.4,
        scale: 1.0,
        removeMetadata: true,
    },
    high: {
        imageQuality: 0.55,
        scale: 1.2,
        removeMetadata: true,
    },
    standard: {
        imageQuality: 0.65,
        scale: 1.4,
        removeMetadata: false,
    },
    medium: {
        imageQuality: 0.75,
        scale: 1.6,
        removeMetadata: false,
    },
    low: {
        imageQuality: 0.85,
        scale: 1.8,
        removeMetadata: false,
    },
};

// Lazy load pdfjs
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
 * Compress a PDF file using the specified preset
 * 
 * This works by:
 * 1. Rendering each page to a canvas at the specified scale
 * 2. Converting the canvas to a JPEG at the specified quality
 * 3. Creating a new PDF with those JPEG images as pages
 */
export async function compressPdf(
    file: File,
    options: PdfCompressionOptions
): Promise<PdfCompressionResult> {
    const { preset, onProgress } = options;
    const settings = presetSettings[preset];

    try {
        onProgress?.({
            percent: 0,
            stage: 'loading',
            message: 'Loading PDF libraries...',
        });

        // Load both libraries
        const [pdfjs, { PDFDocument }] = await Promise.all([
            getPdfJs(),
            import('pdf-lib'),
        ]);

        onProgress?.({
            percent: 5,
            stage: 'loading',
            message: 'Reading PDF file...',
        });

        // Read file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        const originalSize = arrayBuffer.byteLength;

        onProgress?.({
            percent: 10,
            stage: 'processing',
            message: 'Parsing PDF document...',
        });

        // Load with pdfjs for rendering
        const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const pageCount = pdfDoc.numPages;

        onProgress?.({
            percent: 15,
            stage: 'processing',
            message: `Processing ${pageCount} page${pageCount > 1 ? 's' : ''}...`,
        });

        // Create new PDF document
        const newPdfDoc = await PDFDocument.create();

        // Process each page
        const pageImages: { data: Uint8Array; width: number; height: number }[] = [];

        for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
            const progressPercent = 15 + ((pageNum - 1) / pageCount) * 60;
            onProgress?.({
                percent: Math.round(progressPercent),
                stage: 'processing',
                message: `Compressing page ${pageNum} of ${pageCount}...`,
            });

            // Get the page
            const page = await pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: settings.scale });

            // Create canvas
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            if (!context) {
                throw new Error('Could not create canvas context');
            }

            canvas.width = viewport.width;
            canvas.height = viewport.height;

            // Fill with white background (for JPEG)
            context.fillStyle = 'white';
            context.fillRect(0, 0, canvas.width, canvas.height);

            // Render page to canvas
            await page.render({
                canvasContext: context,
                viewport,
                canvas,
            }).promise;

            // Convert to JPEG blob
            const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob(
                    (b) => {
                        if (b) resolve(b);
                        else reject(new Error('Failed to create blob'));
                    },
                    'image/jpeg',
                    settings.imageQuality
                );
            });

            // Convert blob to Uint8Array
            const imageData = new Uint8Array(await blob.arrayBuffer());

            pageImages.push({
                data: imageData,
                width: viewport.width,
                height: viewport.height,
            });

            // Clear canvas to free memory
            canvas.width = 0;
            canvas.height = 0;
        }

        onProgress?.({
            percent: 75,
            stage: 'encoding',
            message: 'Building compressed PDF...',
        });

        // Add each image as a page to the new PDF
        for (let i = 0; i < pageImages.length; i++) {
            const progressPercent = 75 + ((i / pageImages.length) * 15);
            onProgress?.({
                percent: Math.round(progressPercent),
                stage: 'encoding',
                message: `Adding page ${i + 1} to PDF...`,
            });

            const { data, width, height } = pageImages[i];

            // Embed the JPEG image
            const image = await newPdfDoc.embedJpg(data);

            // Add page with the same dimensions as the rendered image
            // Convert from pixels to points (72 points per inch, and we rendered at settings.scale * 72 DPI)
            const pageWidth = width / settings.scale;
            const pageHeight = height / settings.scale;

            const newPage = newPdfDoc.addPage([pageWidth, pageHeight]);

            // Draw the image to fill the page
            newPage.drawImage(image, {
                x: 0,
                y: 0,
                width: pageWidth,
                height: pageHeight,
            });
        }

        // Remove metadata if requested
        if (settings.removeMetadata) {
            newPdfDoc.setTitle('');
            newPdfDoc.setAuthor('');
            newPdfDoc.setSubject('');
            newPdfDoc.setKeywords([]);
            newPdfDoc.setProducer('');
            newPdfDoc.setCreator('');
        }

        onProgress?.({
            percent: 92,
            stage: 'encoding',
            message: 'Saving compressed PDF...',
        });

        // Save the new PDF
        const compressedBytes = await newPdfDoc.save({
            useObjectStreams: true,
        });

        const compressedSize = compressedBytes.byteLength;
        const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

        // Generate output filename
        const baseName = file.name.replace(/\.pdf$/i, '');
        const presetSuffix = preset === 'medium' ? '' : `_${preset}`;
        const fileName = `${baseName}_compressed${presetSuffix}.pdf`;

        onProgress?.({
            percent: 100,
            stage: 'complete',
            message: 'Compression complete!',
        });

        return {
            success: true,
            data: compressedBytes.slice().buffer as ArrayBuffer,
            fileName,
            originalSize,
            compressedSize,
            compressionRatio,
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
 * Get estimated compression for each preset
 */
export function getPresetEstimates(fileSize: number): Record<CompressionPreset, { min: number; max: number }> {
    return {
        extreme: {
            min: Math.round(fileSize * 0.1),
            max: Math.round(fileSize * 0.3),
        },
        high: {
            min: Math.round(fileSize * 0.2),
            max: Math.round(fileSize * 0.4),
        },
        standard: {
            min: Math.round(fileSize * 0.25),
            max: Math.round(fileSize * 0.45),
        },
        medium: {
            min: Math.round(fileSize * 0.35),
            max: Math.round(fileSize * 0.55),
        },
        low: {
            min: Math.round(fileSize * 0.5),
            max: Math.round(fileSize * 0.7),
        },
    };
}
