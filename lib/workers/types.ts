/**
 * Worker Message Types
 * Defines the contract between main thread and workers
 */

// Base message structure for all worker communications
export interface WorkerMessage<T = unknown> {
    type: string;
    payload: T;
    id: string; // Unique identifier for tracking async operations
}

// ============================================
// Image Worker Types
// ============================================

export type ImageFormat = 'png' | 'jpeg' | 'webp' | 'gif' | 'bmp';

export interface ImageConversionPayload {
    imageData: ArrayBuffer;
    fileName: string;
    sourceFormat: string;
    targetFormat: ImageFormat;
    quality?: number; // 0-1 for lossy formats
    preserveTransparency?: boolean;
}

export interface ImageConversionResult {
    success: boolean;
    data?: ArrayBuffer;
    fileName?: string;
    mimeType?: string;
    originalSize: number;
    convertedSize?: number;
    width?: number;
    height?: number;
    error?: string;
}

// ============================================
// Image Resize Types
// ============================================

export interface ImageResizePayload {
    imageData: ArrayBuffer;
    fileName: string;
    sourceFormat: string;
    targetWidth: number;
    targetHeight: number;
    outputFormat: 'jpeg' | 'png' | 'webp';
    quality?: number; // 0-1 for lossy formats
}

export interface ImageResizeResult {
    success: boolean;
    data?: ArrayBuffer;
    fileName?: string;
    mimeType?: string;
    originalSize: number;
    resizedSize?: number;
    originalWidth?: number;
    originalHeight?: number;
    newWidth?: number;
    newHeight?: number;
    error?: string;
}

export interface ImageMetadata {
    name: string;
    size: string;
    sizeBytes: number;
    width: number;
    height: number;
    format: string;
}

// ============================================
// PDF Worker Types
// ============================================

export interface PdfToImagesPayload {
    pdfData: ArrayBuffer;
    fileName: string;
    outputFormat: 'png' | 'jpeg';
    quality?: number; // 0-1 for JPEG
    scale?: number; // Render scale (1 = 72 DPI, 2 = 144 DPI, etc.)
    pageRange?: {
        start?: number;
        end?: number;
    };
}

export interface PdfPageImage {
    pageNumber: number;
    data: ArrayBuffer;
    width: number;
    height: number;
    fileName: string;
}

export interface PdfToImagesResult {
    success: boolean;
    pages?: PdfPageImage[];
    totalPages?: number;
    error?: string;
}

export interface PdfMetadata {
    title?: string;
    author?: string;
    pageCount: number;
    fileName: string;
    fileSize: string;
    fileSizeBytes: number;
}

// ============================================
// Progress & Status Types
// ============================================

export interface ProgressUpdate {
    percent: number;
    stage: 'loading' | 'processing' | 'encoding' | 'complete' | 'error';
    message: string;
}

export type WorkerStatus = 'idle' | 'busy' | 'error';

// ============================================
// Worker Response Types
// ============================================

export interface WorkerSuccessResponse<T> {
    type: 'success';
    id: string;
    result: T;
}

export interface WorkerErrorResponse {
    type: 'error';
    id: string;
    error: string;
}

export interface WorkerProgressResponse {
    type: 'progress';
    id: string;
    progress: ProgressUpdate;
}

export type WorkerResponse<T> =
    | WorkerSuccessResponse<T>
    | WorkerErrorResponse
    | WorkerProgressResponse;

// ============================================
// Utility Types
// ============================================

export interface FileInfo {
    name: string;
    size: number;
    type: string;
    lastModified: number;
}

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
