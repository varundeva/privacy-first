/**
 * PDF Metadata Utilities
 * 
 * Uses pdf-lib to read and edit PDF metadata.
 * Supports title, author, subject, keywords, creator, and producer.
 */

import type { ProgressUpdate } from './types';

export interface PdfMetadata {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string[];
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
}

export interface PdfMetadataEditOptions {
    metadata: Partial<PdfMetadata>;
    onProgress?: (progress: ProgressUpdate) => void;
}

export interface PdfMetadataResult {
    success: boolean;
    data?: ArrayBuffer;
    fileName?: string;
    metadata?: PdfMetadata;
    pageCount?: number;
    error?: string;
}

/**
 * Read metadata from a PDF
 */
export async function readPdfMetadata(
    file: File,
    onProgress?: (progress: ProgressUpdate) => void
): Promise<PdfMetadataResult> {
    try {
        onProgress?.({
            percent: 0,
            stage: 'loading',
            message: 'Loading PDF library...',
        });

        const { PDFDocument } = await import('pdf-lib');

        onProgress?.({
            percent: 30,
            stage: 'loading',
            message: 'Reading PDF file...',
        });

        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);

        onProgress?.({
            percent: 70,
            stage: 'processing',
            message: 'Extracting metadata...',
        });

        const metadata: PdfMetadata = {
            title: pdfDoc.getTitle() || undefined,
            author: pdfDoc.getAuthor() || undefined,
            subject: pdfDoc.getSubject() || undefined,
            keywords: pdfDoc.getKeywords()?.split(',').map(k => k.trim()).filter(k => k) || undefined,
            creator: pdfDoc.getCreator() || undefined,
            producer: pdfDoc.getProducer() || undefined,
            creationDate: pdfDoc.getCreationDate() || undefined,
            modificationDate: pdfDoc.getModificationDate() || undefined,
        };

        onProgress?.({
            percent: 100,
            stage: 'complete',
            message: 'Metadata extracted!',
        });

        return {
            success: true,
            metadata,
            pageCount: pdfDoc.getPageCount(),
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
 * Edit metadata in a PDF
 */
export async function editPdfMetadata(
    file: File,
    options: PdfMetadataEditOptions
): Promise<PdfMetadataResult> {
    const { metadata, onProgress } = options;

    try {
        onProgress?.({
            percent: 0,
            stage: 'loading',
            message: 'Loading PDF library...',
        });

        const { PDFDocument } = await import('pdf-lib');

        onProgress?.({
            percent: 20,
            stage: 'loading',
            message: 'Reading PDF file...',
        });

        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);

        onProgress?.({
            percent: 40,
            stage: 'processing',
            message: 'Updating metadata...',
        });

        // Update metadata fields
        if (metadata.title !== undefined) {
            pdfDoc.setTitle(metadata.title);
        }
        if (metadata.author !== undefined) {
            pdfDoc.setAuthor(metadata.author);
        }
        if (metadata.subject !== undefined) {
            pdfDoc.setSubject(metadata.subject);
        }
        if (metadata.keywords !== undefined) {
            pdfDoc.setKeywords(metadata.keywords);
        }
        if (metadata.creator !== undefined) {
            pdfDoc.setCreator(metadata.creator);
        }
        if (metadata.producer !== undefined) {
            pdfDoc.setProducer(metadata.producer);
        }

        // Always update modification date
        pdfDoc.setModificationDate(new Date());

        onProgress?.({
            percent: 70,
            stage: 'encoding',
            message: 'Saving PDF...',
        });

        const pdfBytes = await pdfDoc.save();

        // Generate filename
        const baseName = file.name.replace(/\.pdf$/i, '');
        const fileName = `${baseName}_metadata_updated.pdf`;

        // Read back the updated metadata
        const updatedMetadata: PdfMetadata = {
            title: pdfDoc.getTitle() || undefined,
            author: pdfDoc.getAuthor() || undefined,
            subject: pdfDoc.getSubject() || undefined,
            keywords: pdfDoc.getKeywords()?.split(',').map(k => k.trim()).filter(k => k) || undefined,
            creator: pdfDoc.getCreator() || undefined,
            producer: pdfDoc.getProducer() || undefined,
            creationDate: pdfDoc.getCreationDate() || undefined,
            modificationDate: pdfDoc.getModificationDate() || undefined,
        };

        onProgress?.({
            percent: 100,
            stage: 'complete',
            message: 'Metadata updated!',
        });

        return {
            success: true,
            data: pdfBytes.buffer as ArrayBuffer,
            fileName,
            metadata: updatedMetadata,
            pageCount: pdfDoc.getPageCount(),
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
