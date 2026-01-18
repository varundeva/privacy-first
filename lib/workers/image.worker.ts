/**
 * Image Processing Web Worker
 * Handles all image conversion operations off the main thread
 * 
 * Supported operations:
 * - JPG to PNG
 * - PNG to JPG
 * - Image to WebP
 * - And more...
 */

import type {
    WorkerMessage,
    ImageConversionPayload,
    ImageConversionResult,
    ProgressUpdate,
} from './types';

// Worker context
const ctx: Worker = self as unknown as Worker;

// Send progress update to main thread
function sendProgress(id: string, progress: ProgressUpdate): void {
    ctx.postMessage({ type: 'progress', id, progress });
}

// Send success result to main thread
function sendSuccess(id: string, result: ImageConversionResult): void {
    ctx.postMessage({ type: 'success', id, result });
}

// Send error to main thread
function sendError(id: string, error: string): void {
    ctx.postMessage({ type: 'error', id, error });
}

/**
 * Get MIME type from format
 */
function getMimeType(format: string): string {
    const mimeTypes: Record<string, string> = {
        png: 'image/png',
        jpeg: 'image/jpeg',
        jpg: 'image/jpeg',
        webp: 'image/webp',
        gif: 'image/gif',
        bmp: 'image/bmp',
    };
    return mimeTypes[format.toLowerCase()] || 'image/png';
}

/**
 * Convert ArrayBuffer to ImageBitmap using OffscreenCanvas
 */
async function arrayBufferToImageBitmap(buffer: ArrayBuffer): Promise<ImageBitmap> {
    const blob = new Blob([buffer]);
    return await createImageBitmap(blob);
}

/**
 * Main image conversion function
 */
async function convertImage(
    id: string,
    payload: ImageConversionPayload
): Promise<void> {
    try {
        // Stage 1: Loading
        sendProgress(id, {
            percent: 10,
            stage: 'loading',
            message: 'Loading image...',
        });

        // Create ImageBitmap from ArrayBuffer
        const imageBitmap = await arrayBufferToImageBitmap(payload.imageData);
        const { width, height } = imageBitmap;

        // Stage 2: Processing
        sendProgress(id, {
            percent: 30,
            stage: 'processing',
            message: 'Processing image...',
        });

        // Create OffscreenCanvas for rendering
        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Failed to get canvas context');
        }

        // Handle transparency for formats that don't support it
        const nonTransparentFormats = ['jpeg', 'jpg', 'bmp'];
        if (nonTransparentFormats.includes(payload.targetFormat.toLowerCase())) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
        }

        // Draw the image
        ctx.drawImage(imageBitmap, 0, 0);

        // Stage 3: Encoding
        sendProgress(id, {
            percent: 60,
            stage: 'encoding',
            message: `Encoding to ${payload.targetFormat.toUpperCase()}...`,
        });

        // Convert to target format
        const mimeType = getMimeType(payload.targetFormat);
        const quality = payload.quality ?? 1.0;
        const blob = await canvas.convertToBlob({ type: mimeType, quality });

        // Get ArrayBuffer from blob
        const resultBuffer = await blob.arrayBuffer();

        // Generate new filename
        const baseName = payload.fileName.replace(/\.[^.]*$/, '');
        const newFileName = `${baseName}.${payload.targetFormat}`;

        // Stage 4: Complete
        sendProgress(id, {
            percent: 100,
            stage: 'complete',
            message: 'Conversion complete!',
        });

        // Send result
        sendSuccess(id, {
            success: true,
            data: resultBuffer,
            fileName: newFileName,
            mimeType,
            originalSize: payload.imageData.byteLength,
            convertedSize: resultBuffer.byteLength,
            width,
            height,
        });

        // Cleanup
        imageBitmap.close();
    } catch (error) {
        sendError(id, error instanceof Error ? error.message : 'Unknown error occurred');
    }
}

/**
 * Message handler
 */
ctx.onmessage = async (event: MessageEvent<WorkerMessage<ImageConversionPayload>>) => {
    const { type, payload, id } = event.data;

    switch (type) {
        case 'convert':
            await convertImage(id, payload);
            break;

        default:
            sendError(id, `Unknown message type: ${type}`);
    }
};

// Make TypeScript happy with the export
export { };
