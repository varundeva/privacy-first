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

export interface ImageMetadata {
    name: string;
    size: string;
    sizeBytes: number;
    width: number;
    height: number;
    format: string;
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
