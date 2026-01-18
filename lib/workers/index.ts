// Workers - Main export file
// Only export the manager, not the worker itself (workers are loaded via URL)

export {
    convertImage,
    terminateAllWorkers,
    type ProgressCallback,
    type ProgressUpdate,
    type ImageConversionResult,
} from './worker-manager';

export {
    formatFileSize,
    type ImageMetadata,
    type ImageFormat,
    type FileInfo,
} from './types';
