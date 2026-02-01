/**
 * PDF Header/Footer Utilities
 * 
 * Uses pdf-lib to add headers and footers to PDF documents.
 * Supports custom text, positioning, and styling.
 */

import type { ProgressUpdate } from './types';

export type HeaderFooterPosition = 'left' | 'center' | 'right';

export interface HeaderFooterConfig {
    text: string;
    position?: HeaderFooterPosition;
    fontSize?: number;
    includePageNumber?: boolean;
    pageNumberFormat?: 'number' | 'page-n' | 'n-of-total' | 'page-n-of-total';
}

export interface PdfHeaderFooterOptions {
    header?: HeaderFooterConfig;
    footer?: HeaderFooterConfig;
    margin?: number;
    skipFirstPage?: boolean;
    pageRange?: { start?: number; end?: number };
    onProgress?: (progress: ProgressUpdate) => void;
}

export interface PdfHeaderFooterResult {
    success: boolean;
    data?: ArrayBuffer;
    fileName?: string;
    pageCount?: number;
    error?: string;
}

/**
 * Add header and/or footer to PDF
 */
export async function addHeaderFooterToPdf(
    file: File,
    options: PdfHeaderFooterOptions
): Promise<PdfHeaderFooterResult> {
    const {
        header,
        footer,
        margin = 40,
        skipFirstPage = false,
        pageRange,
        onProgress,
    } = options;

    try {
        if (!header && !footer) {
            throw new Error('Please specify a header or footer');
        }

        onProgress?.({
            percent: 0,
            stage: 'loading',
            message: 'Loading PDF library...',
        });

        const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');

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
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const pages = pdfDoc.getPages();
        const totalPages = pages.length;

        // Determine page range
        const startPage = (pageRange?.start ?? 1) - 1;
        const endPage = Math.min((pageRange?.end ?? totalPages) - 1, totalPages - 1);

        // Helper to format page number
        const formatPageNumber = (
            pageNum: number,
            format: HeaderFooterConfig['pageNumberFormat']
        ): string => {
            switch (format) {
                case 'page-n':
                    return `Page ${pageNum}`;
                case 'n-of-total':
                    return `${pageNum} of ${totalPages}`;
                case 'page-n-of-total':
                    return `Page ${pageNum} of ${totalPages}`;
                case 'number':
                default:
                    return `${pageNum}`;
            }
        };

        // Process each page
        for (let i = startPage; i <= endPage; i++) {
            const progressPercent = 25 + ((i - startPage) / (endPage - startPage + 1)) * 65;

            onProgress?.({
                percent: Math.round(progressPercent),
                stage: 'processing',
                message: `Adding header/footer to page ${i + 1}...`,
            });

            // Skip first page if configured
            if (skipFirstPage && i === 0) continue;

            const page = pages[i];
            const { width, height } = page.getSize();
            const pageNum = i + 1;

            // Add header
            if (header) {
                const fontSize = header.fontSize ?? 10;
                const position = header.position ?? 'center';

                let text = header.text;
                if (header.includePageNumber) {
                    const pageNumStr = formatPageNumber(pageNum, header.pageNumberFormat);
                    text = text ? `${text} | ${pageNumStr}` : pageNumStr;
                }

                const textWidth = font.widthOfTextAtSize(text, fontSize);
                let x: number;

                switch (position) {
                    case 'left':
                        x = margin;
                        break;
                    case 'right':
                        x = width - margin - textWidth;
                        break;
                    case 'center':
                    default:
                        x = (width - textWidth) / 2;
                        break;
                }

                const y = height - margin;

                page.drawText(text, {
                    x,
                    y,
                    size: fontSize,
                    font,
                    color: rgb(0.3, 0.3, 0.3),
                });
            }

            // Add footer
            if (footer) {
                const fontSize = footer.fontSize ?? 10;
                const position = footer.position ?? 'center';

                let text = footer.text;
                if (footer.includePageNumber) {
                    const pageNumStr = formatPageNumber(pageNum, footer.pageNumberFormat);
                    text = text ? `${text} | ${pageNumStr}` : pageNumStr;
                }

                const textWidth = font.widthOfTextAtSize(text, fontSize);
                let x: number;

                switch (position) {
                    case 'left':
                        x = margin;
                        break;
                    case 'right':
                        x = width - margin - textWidth;
                        break;
                    case 'center':
                    default:
                        x = (width - textWidth) / 2;
                        break;
                }

                const y = margin - fontSize;

                page.drawText(text, {
                    x,
                    y,
                    size: fontSize,
                    font,
                    color: rgb(0.3, 0.3, 0.3),
                });
            }
        }

        onProgress?.({
            percent: 92,
            stage: 'encoding',
            message: 'Saving PDF...',
        });

        const pdfBytes = await pdfDoc.save();
        const baseName = file.name.replace(/\.pdf$/i, '');
        const fileName = `${baseName}_with_header_footer.pdf`;

        onProgress?.({
            percent: 100,
            stage: 'complete',
            message: 'Header/footer added successfully!',
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
