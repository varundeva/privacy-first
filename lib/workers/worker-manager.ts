/**
 * Worker Manager
 * Handles Web Worker lifecycle and communication
 * Provides a Promise-based API for worker operations
 */

import type {
    WorkerMessage,
    WorkerResponse,
    ImageConversionPayload,
    ImageConversionResult,
    ImageResizePayload,
    ImageResizeResult,
    ProgressUpdate,
} from './types';

type ProgressCallback = (progress: ProgressUpdate) => void;

interface PendingOperation<T> {
    resolve: (result: T) => void;
    reject: (error: Error) => void;
    onProgress?: ProgressCallback;
}

/**
 * Generic Worker Manager class
 */
class WorkerPool<TPayload, TResult> {
    private worker: Worker | null = null;
    private pendingOperations: Map<string, PendingOperation<TResult>> = new Map();
    private workerFactory: () => Worker;
    private messageCounter = 0;

    constructor(workerFactory: () => Worker) {
        this.workerFactory = workerFactory;
    }

    /**
     * Initialize worker if not already created
     */
    private ensureWorker(): Worker {
        if (!this.worker) {
            this.worker = this.workerFactory();
            this.worker.onmessage = this.handleMessage.bind(this);
            this.worker.onerror = this.handleError.bind(this);
        }
        return this.worker;
    }

    /**
     * Handle messages from worker
     */
    private handleMessage(event: MessageEvent<WorkerResponse<TResult>>): void {
        const { type, id } = event.data;
        const operation = this.pendingOperations.get(id);

        if (!operation) return;

        switch (type) {
            case 'success':
                operation.resolve(event.data.result);
                this.pendingOperations.delete(id);
                break;

            case 'error':
                operation.reject(new Error((event.data as { error: string }).error));
                this.pendingOperations.delete(id);
                break;

            case 'progress':
                if (operation.onProgress) {
                    operation.onProgress((event.data as { progress: ProgressUpdate }).progress);
                }
                break;
        }
    }

    /**
     * Handle worker errors
     */
    private handleError(event: ErrorEvent): void {
        console.error('Worker error:', event);
        // Reject all pending operations
        this.pendingOperations.forEach((operation) => {
            operation.reject(new Error('Worker error: ' + event.message));
        });
        this.pendingOperations.clear();
    }

    /**
     * Generate unique message ID
     */
    private generateId(): string {
        return `msg_${Date.now()}_${++this.messageCounter}`;
    }

    /**
     * Execute an operation on the worker
     */
    execute(
        type: string,
        payload: TPayload,
        onProgress?: ProgressCallback,
        transferables?: Transferable[]
    ): Promise<TResult> {
        return new Promise((resolve, reject) => {
            const worker = this.ensureWorker();
            const id = this.generateId();

            this.pendingOperations.set(id, { resolve, reject, onProgress });

            const message: WorkerMessage<TPayload> = { type, payload, id };

            if (transferables && transferables.length > 0) {
                worker.postMessage(message, transferables);
            } else {
                worker.postMessage(message);
            }
        });
    }

    /**
     * Terminate the worker
     */
    terminate(): void {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
            this.pendingOperations.clear();
        }
    }
}

// ============================================
// Image Worker Instance
// ============================================

// Use unknown for flexibility with multiple operation types
let imageWorkerPool: WorkerPool<unknown, unknown> | null = null;

/**
 * Get or create the image worker pool
 */
function getImageWorkerPool(): WorkerPool<unknown, unknown> {
    if (!imageWorkerPool) {
        imageWorkerPool = new WorkerPool<unknown, unknown>(
            () => new Worker(new URL('./image.worker.ts', import.meta.url), { type: 'module' })
        );
    }
    return imageWorkerPool;
}

/**
 * Convert an image using the image worker
 */
export async function convertImage(
    file: File,
    targetFormat: ImageConversionPayload['targetFormat'],
    options?: {
        quality?: number;
        preserveTransparency?: boolean;
        onProgress?: ProgressCallback;
    }
): Promise<ImageConversionResult> {
    const pool = getImageWorkerPool();

    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Get source format from file extension
    const sourceFormat = file.name.split('.').pop()?.toLowerCase() || 'unknown';

    const payload: ImageConversionPayload = {
        imageData: arrayBuffer,
        fileName: file.name,
        sourceFormat,
        targetFormat,
        quality: options?.quality,
        preserveTransparency: options?.preserveTransparency,
    };

    // Transfer the ArrayBuffer to avoid copying
    return pool.execute('convert', payload, options?.onProgress, [arrayBuffer]) as Promise<ImageConversionResult>;
}

/**
 * Resize an image using the image worker
 */
export async function resizeImage(
    file: File,
    targetWidth: number,
    targetHeight: number,
    options?: {
        outputFormat?: 'jpeg' | 'png' | 'webp';
        quality?: number;
        onProgress?: ProgressCallback;
    }
): Promise<ImageResizeResult> {
    const pool = getImageWorkerPool();

    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Get source format from file extension
    const sourceFormat = file.name.split('.').pop()?.toLowerCase() || 'unknown';

    const payload: ImageResizePayload = {
        imageData: arrayBuffer,
        fileName: file.name,
        sourceFormat,
        targetWidth,
        targetHeight,
        outputFormat: options?.outputFormat || 'jpeg',
        quality: options?.quality,
    };

    // Transfer the ArrayBuffer to avoid copying
    return pool.execute('resize', payload, options?.onProgress, [arrayBuffer]) as Promise<ImageResizeResult>;
}

/**
 * Cleanup all workers
 */
export function terminateAllWorkers(): void {
    imageWorkerPool?.terminate();
    imageWorkerPool = null;
}

// Export types
export type { ProgressCallback, ProgressUpdate, ImageConversionResult, ImageResizeResult };

