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
    ImageResizePayload,
    ImageResizeResult,
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
 * Resize image function
 * Uses high-quality multi-step downscaling for best results
 */
async function resizeImage(
    id: string,
    payload: ImageResizePayload
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
        const originalWidth = imageBitmap.width;
        const originalHeight = imageBitmap.height;

        // Stage 2: Processing/Resizing
        sendProgress(id, {
            percent: 30,
            stage: 'processing',
            message: `Resizing to ${payload.targetWidth}×${payload.targetHeight}...`,
        });

        const targetWidth = payload.targetWidth;
        const targetHeight = payload.targetHeight;

        // For high-quality downscaling, use multi-step approach if reducing by > 50%
        let currentBitmap = imageBitmap;
        let currentWidth = originalWidth;
        let currentHeight = originalHeight;

        // Multi-step downscaling for better quality
        while (currentWidth > targetWidth * 2 || currentHeight > targetHeight * 2) {
            const stepWidth = Math.max(targetWidth, Math.floor(currentWidth / 2));
            const stepHeight = Math.max(targetHeight, Math.floor(currentHeight / 2));

            const stepCanvas = new OffscreenCanvas(stepWidth, stepHeight);
            const stepCtx = stepCanvas.getContext('2d');

            if (stepCtx) {
                stepCtx.imageSmoothingEnabled = true;
                stepCtx.imageSmoothingQuality = 'high';
                stepCtx.drawImage(currentBitmap, 0, 0, stepWidth, stepHeight);

                // Close previous bitmap if not the original
                if (currentBitmap !== imageBitmap) {
                    currentBitmap.close();
                }

                // Create new bitmap from step canvas
                currentBitmap = await createImageBitmap(stepCanvas);
                currentWidth = stepWidth;
                currentHeight = stepHeight;
            }

            sendProgress(id, {
                percent: 40,
                stage: 'processing',
                message: 'Applying high-quality resize...',
            });
        }

        // Final resize step
        const canvas = new OffscreenCanvas(targetWidth, targetHeight);
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Failed to get canvas context');
        }

        // Enable high quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Handle background for non-transparent formats
        const nonTransparentFormats = ['jpeg', 'jpg'];
        if (nonTransparentFormats.includes(payload.outputFormat.toLowerCase())) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, targetWidth, targetHeight);
        }

        // Draw the final resized image
        ctx.drawImage(currentBitmap, 0, 0, targetWidth, targetHeight);

        // Stage 3: Encoding
        sendProgress(id, {
            percent: 70,
            stage: 'encoding',
            message: `Encoding to ${payload.outputFormat.toUpperCase()}...`,
        });

        // Convert to target format
        const mimeType = getMimeType(payload.outputFormat);
        const quality = payload.quality ?? 0.92;
        const blob = await canvas.convertToBlob({ type: mimeType, quality });

        // Get ArrayBuffer from blob
        const resultBuffer = await blob.arrayBuffer();

        // Generate new filename
        const baseName = payload.fileName.replace(/\.[^.]*$/, '');
        const extension = payload.outputFormat === 'jpeg' ? 'jpg' : payload.outputFormat;
        const newFileName = `${baseName}_${targetWidth}x${targetHeight}.${extension}`;

        // Stage 4: Complete
        sendProgress(id, {
            percent: 100,
            stage: 'complete',
            message: 'Resize complete!',
        });

        // Send result using the existing helper (cast to any for ImageResizeResult)
        sendSuccess(id, {
            success: true,
            data: resultBuffer,
            fileName: newFileName,
            mimeType,
            originalSize: payload.imageData.byteLength,
            resizedSize: resultBuffer.byteLength,
            originalWidth,
            originalHeight,
            newWidth: targetWidth,
            newHeight: targetHeight,
        } as unknown as ImageConversionResult);

        // Cleanup
        imageBitmap.close();
        if (currentBitmap !== imageBitmap) {
            currentBitmap.close();
        }
    } catch (error) {
        sendError(id, error instanceof Error ? error.message : 'Unknown error occurred');
    }
}

/**
 * Message handler
 */
ctx.onmessage = async (event: MessageEvent<WorkerMessage<ImageConversionPayload | ImageResizePayload>>) => {
    const { type, payload, id } = event.data;

    switch (type) {
        case 'convert':
            await convertImage(id, payload as ImageConversionPayload);
            break;

        case 'resize':
            await resizeImage(id, payload as ImageResizePayload);
            break;

        default:
            sendError(id, `Unknown message type: ${type}`);
    }
};

// Make TypeScript happy with the export
export { };

