/**
 * PDF Sign Utilities
 * 
 * Uses pdf-lib to add signature images to PDF documents.
 * Allows positioning and sizing of signatures on specific pages.
 */

import type { ProgressUpdate } from './types';

export type SignaturePosition =
    | 'bottom-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'top-right'
    | 'top-left'
    | 'top-center'
    | 'center'
    | 'custom';

export interface PdfSignOptions {
    signatureImage: ArrayBuffer;
    imageType: 'png' | 'jpeg';
    pageNumbers?: number[];  // 1-based, empty = all pages
    position?: SignaturePosition;
    customPosition?: { x: number; y: number };  // Bottom-left origin, in points
    scale?: number;  // Scale factor for signature, default 1.0
    margin?: number;  // Margin from edges in points
    onProgress?: (progress: ProgressUpdate) => void;
}

export interface PdfSignResult {
    success: boolean;
    data?: ArrayBuffer;
    fileName?: string;
    pageCount?: number;
    signedPages?: number;
    error?: string;
}

/**
 * Add signature to PDF
 */
export async function signPdf(
    file: File,
    options: PdfSignOptions
): Promise<PdfSignResult> {
    const {
        signatureImage,
        imageType,
        pageNumbers,
        position = 'bottom-right',
        customPosition,
        scale = 1.0,
        margin = 40,
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

        onProgress?.({
            percent: 25,
            stage: 'processing',
            message: 'Embedding signature image...',
        });

        // Embed signature image
        let signatureImg;
        if (imageType === 'png') {
            signatureImg = await pdfDoc.embedPng(signatureImage);
        } else {
            signatureImg = await pdfDoc.embedJpg(signatureImage);
        }

        // Apply scale
        const sigWidth = signatureImg.width * scale;
        const sigHeight = signatureImg.height * scale;

        // Determine which pages to sign
        const pagesToSign = pageNumbers && pageNumbers.length > 0
            ? pageNumbers.map(p => p - 1).filter(i => i >= 0 && i < totalPages)
            : pages.map((_, i) => i);

        if (pagesToSign.length === 0) {
            throw new Error('No valid pages selected for signing');
        }

        // Add signature to each page
        for (let i = 0; i < pagesToSign.length; i++) {
            const pageIndex = pagesToSign[i];
            const progressPercent = 30 + ((i / pagesToSign.length) * 60);

            onProgress?.({
                percent: Math.round(progressPercent),
                stage: 'processing',
                message: `Adding signature to page ${pageIndex + 1}...`,
            });

            const page = pages[pageIndex];
            const { width, height } = page.getSize();

            // Calculate position
            let x: number;
            let y: number;

            if (position === 'custom' && customPosition) {
                x = customPosition.x;
                y = customPosition.y;
            } else {
                switch (position) {
                    case 'bottom-left':
                        x = margin;
                        y = margin;
                        break;
                    case 'bottom-center':
                        x = (width - sigWidth) / 2;
                        y = margin;
                        break;
                    case 'bottom-right':
                        x = width - sigWidth - margin;
                        y = margin;
                        break;
                    case 'top-left':
                        x = margin;
                        y = height - sigHeight - margin;
                        break;
                    case 'top-center':
                        x = (width - sigWidth) / 2;
                        y = height - sigHeight - margin;
                        break;
                    case 'top-right':
                        x = width - sigWidth - margin;
                        y = height - sigHeight - margin;
                        break;
                    case 'center':
                    default:
                        x = (width - sigWidth) / 2;
                        y = (height - sigHeight) / 2;
                        break;
                }
            }

            page.drawImage(signatureImg, {
                x,
                y,
                width: sigWidth,
                height: sigHeight,
            });
        }

        onProgress?.({
            percent: 92,
            stage: 'encoding',
            message: 'Saving signed PDF...',
        });

        const pdfBytes = await pdfDoc.save();
        const baseName = file.name.replace(/\.pdf$/i, '');
        const fileName = `${baseName}_signed.pdf`;

        onProgress?.({
            percent: 100,
            stage: 'complete',
            message: 'PDF signed successfully!',
        });

        return {
            success: true,
            data: pdfBytes.buffer as ArrayBuffer,
            fileName,
            pageCount: totalPages,
            signedPages: pagesToSign.length,
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
