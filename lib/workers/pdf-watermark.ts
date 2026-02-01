/**
 * PDF Watermark Utilities
 * 
 * Uses pdf-lib to add text or image watermarks to PDF pages.
 * Supports custom positioning, opacity, rotation, and styling.
 */

import type { ProgressUpdate } from './types';

export type WatermarkType = 'text' | 'image';
export type WatermarkPosition =
    | 'center'
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'
    | 'diagonal';

export interface TextWatermarkOptions {
    type: 'text';
    text: string;
    fontSize?: number;
    opacity?: number;
    rotation?: number;
    color?: { r: number; g: number; b: number };
    position?: WatermarkPosition;
}

export interface ImageWatermarkOptions {
    type: 'image';
    imageData: ArrayBuffer;
    imageType: 'png' | 'jpeg';
    scale?: number;
    opacity?: number;
    rotation?: number;
    position?: WatermarkPosition;
}

export type WatermarkOptions = TextWatermarkOptions | ImageWatermarkOptions;

export interface PdfWatermarkConfig {
    watermark: WatermarkOptions;
    pageRange?: { start?: number; end?: number };
    onProgress?: (progress: ProgressUpdate) => void;
}

export interface PdfWatermarkResult {
    success: boolean;
    data?: ArrayBuffer;
    fileName?: string;
    pageCount?: number;
    error?: string;
}

/**
 * Add watermark to PDF
 */
export async function addWatermarkToPdf(
    file: File,
    config: PdfWatermarkConfig
): Promise<PdfWatermarkResult> {
    const { watermark, pageRange, onProgress } = config;

    try {
        onProgress?.({
            percent: 0,
            stage: 'loading',
            message: 'Loading PDF library...',
        });

        // Dynamically import pdf-lib
        const { PDFDocument, rgb, degrees, StandardFonts } = await import('pdf-lib');

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

        // Prepare watermark resources
        let embeddedImage: Awaited<ReturnType<typeof pdfDoc.embedPng>> | null = null;
        let font: Awaited<ReturnType<typeof pdfDoc.embedFont>> | null = null;

        if (watermark.type === 'image') {
            onProgress?.({
                percent: 25,
                stage: 'processing',
                message: 'Embedding watermark image...',
            });

            if (watermark.imageType === 'png') {
                embeddedImage = await pdfDoc.embedPng(watermark.imageData);
            } else {
                embeddedImage = await pdfDoc.embedJpg(watermark.imageData);
            }
        } else {
            font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        }

        // Process each page
        for (let i = startPage; i <= endPage; i++) {
            const progressPercent = 30 + ((i - startPage) / (endPage - startPage + 1)) * 60;

            onProgress?.({
                percent: Math.round(progressPercent),
                stage: 'processing',
                message: `Adding watermark to page ${i + 1}...`,
            });

            const page = pages[i];
            const { width, height } = page.getSize();

            if (watermark.type === 'text' && font) {
                const fontSize = watermark.fontSize ?? 48;
                const opacity = watermark.opacity ?? 0.3;
                const rotation = watermark.rotation ?? (watermark.position === 'diagonal' ? 45 : 0);
                const color = watermark.color ?? { r: 0.5, g: 0.5, b: 0.5 };
                const textWidth = font.widthOfTextAtSize(watermark.text, fontSize);
                const textHeight = fontSize;

                let x = width / 2 - textWidth / 2;
                let y = height / 2 - textHeight / 2;

                // Position calculation
                switch (watermark.position) {
                    case 'top-left':
                        x = 50;
                        y = height - 50 - textHeight;
                        break;
                    case 'top-center':
                        x = width / 2 - textWidth / 2;
                        y = height - 50 - textHeight;
                        break;
                    case 'top-right':
                        x = width - 50 - textWidth;
                        y = height - 50 - textHeight;
                        break;
                    case 'bottom-left':
                        x = 50;
                        y = 50;
                        break;
                    case 'bottom-center':
                        x = width / 2 - textWidth / 2;
                        y = 50;
                        break;
                    case 'bottom-right':
                        x = width - 50 - textWidth;
                        y = 50;
                        break;
                    case 'diagonal':
                    case 'center':
                    default:
                        x = width / 2 - textWidth / 2;
                        y = height / 2 - textHeight / 2;
                        break;
                }

                page.drawText(watermark.text, {
                    x,
                    y,
                    size: fontSize,
                    font,
                    color: rgb(color.r, color.g, color.b),
                    opacity,
                    rotate: degrees(rotation),
                });
            } else if (watermark.type === 'image' && embeddedImage) {
                const scale = watermark.scale ?? 0.5;
                const opacity = watermark.opacity ?? 0.3;
                const imgWidth = embeddedImage.width * scale;
                const imgHeight = embeddedImage.height * scale;

                let x = width / 2 - imgWidth / 2;
                let y = height / 2 - imgHeight / 2;

                // Position calculation
                switch (watermark.position) {
                    case 'top-left':
                        x = 50;
                        y = height - 50 - imgHeight;
                        break;
                    case 'top-center':
                        x = width / 2 - imgWidth / 2;
                        y = height - 50 - imgHeight;
                        break;
                    case 'top-right':
                        x = width - 50 - imgWidth;
                        y = height - 50 - imgHeight;
                        break;
                    case 'bottom-left':
                        x = 50;
                        y = 50;
                        break;
                    case 'bottom-center':
                        x = width / 2 - imgWidth / 2;
                        y = 50;
                        break;
                    case 'bottom-right':
                        x = width - 50 - imgWidth;
                        y = 50;
                        break;
                    case 'center':
                    case 'diagonal':
                    default:
                        x = width / 2 - imgWidth / 2;
                        y = height / 2 - imgHeight / 2;
                        break;
                }

                page.drawImage(embeddedImage, {
                    x,
                    y,
                    width: imgWidth,
                    height: imgHeight,
                    opacity,
                });
            }
        }

        onProgress?.({
            percent: 90,
            stage: 'encoding',
            message: 'Saving watermarked PDF...',
        });

        const pdfBytes = await pdfDoc.save();
        const baseName = file.name.replace(/\.pdf$/i, '');
        const fileName = `${baseName}_watermarked.pdf`;

        onProgress?.({
            percent: 100,
            stage: 'complete',
            message: 'Watermark added successfully!',
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
