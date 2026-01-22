'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  RotateCcw, 
  Download,
  Check,
  FileText,
  Zap,
  Scale,
  HardDrive,
  Sparkles,
} from 'lucide-react';
import { ProcessingStatus } from '../shared/ProcessingStatus';
import { compressPdf, type CompressionPreset } from '@/lib/workers/pdf-compress';
import { formatFileSize, type ProgressUpdate } from '@/lib/workers/types';

interface PdfCompressorProps {
  file: File;
  onReset: () => void;
}

type CompressionState = 
  | { status: 'idle' }
  | { status: 'selecting-preset' }
  | { status: 'processing'; progress: ProgressUpdate }
  | { status: 'complete'; result: CompressedResult }
  | { status: 'error'; message: string };

interface CompressedResult {
  data: ArrayBuffer;
  fileName: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

interface PresetOption {
  id: CompressionPreset;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  expectedReduction: string;
}

const presetOptions: PresetOption[] = [
  {
    id: 'extreme',
    name: 'Extreme',
    description: 'Maximum compression, may reduce quality significantly',
    icon: <Zap className="h-5 w-5" />,
    color: 'text-red-500',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    expectedReduction: '60-80%',
  },
  {
    id: 'high',
    name: 'High',
    description: 'Strong compression with noticeable quality reduction',
    icon: <HardDrive className="h-5 w-5" />,
    color: 'text-orange-500',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    expectedReduction: '40-60%',
  },
  {
    id: 'medium',
    name: 'Medium',
    description: 'Balanced compression and quality',
    icon: <Scale className="h-5 w-5" />,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    expectedReduction: '20-40%',
  },
  {
    id: 'low',
    name: 'Low',
    description: 'Light compression, preserves most quality',
    icon: <Sparkles className="h-5 w-5" />,
    color: 'text-green-500',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    expectedReduction: '10-20%',
  },
];

/**
 * PDF Compressor Component
 * 
 * Compresses PDF files using various preset quality levels.
 * All processing happens in the browser for maximum privacy.
 */
export function PdfCompressor({ file, onReset }: PdfCompressorProps) {
  const [state, setState] = useState<CompressionState>({ status: 'selecting-preset' });
  const [selectedPreset, setSelectedPreset] = useState<CompressionPreset | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Handle preset selection and start compression
  const handlePresetSelect = useCallback(async (preset: CompressionPreset) => {
    setSelectedPreset(preset);
    
    try {
      setState({
        status: 'processing',
        progress: { percent: 0, stage: 'loading', message: 'Loading PDF...' },
      });

      const result = await compressPdf(file, {
        preset,
        onProgress: (progress) => {
          setState({ status: 'processing', progress });
        },
      });

      if (result.success && result.data) {
        // Create preview URL
        const blob = new Blob([result.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);

        setState({
          status: 'complete',
          result: {
            data: result.data,
            fileName: result.fileName || file.name.replace('.pdf', '_compressed.pdf'),
            originalSize: file.size,
            compressedSize: result.data.byteLength,
            compressionRatio: result.compressionRatio || 0,
          },
        });
      } else {
        setState({
          status: 'error',
          message: result.error || 'Failed to compress PDF',
        });
      }
    } catch (error) {
      setState({
        status: 'error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  }, [file]);

  const handleRetry = useCallback(() => {
    setSelectedPreset(null);
    setState({ status: 'selecting-preset' });
  }, []);

  const handleDownload = useCallback(() => {
    if (state.status !== 'complete') return;
    
    const blob = new Blob([state.result.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = state.result.fileName;
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  // Preset selection state
  if (state.status === 'idle' || state.status === 'selecting-preset') {
    return (
      <div className="space-y-6">
        {/* File Info Card */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
              <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{file.name}</h3>
              <p className="text-sm text-muted-foreground">
                Current size: {formatFileSize(file.size)}
              </p>
            </div>
          </div>
        </Card>

        {/* Preset Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Choose Compression Level</h3>
          <p className="text-sm text-muted-foreground">
            Select a compression preset based on your needs. Higher compression means smaller files but may affect quality.
          </p>
          
          <div className="grid gap-3 sm:grid-cols-2">
            {presetOptions.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset.id)}
                className={`group relative flex items-start gap-4 rounded-xl border-2 p-4 text-left transition-all hover:border-purple-500 hover:shadow-lg ${
                  selectedPreset === preset.id 
                    ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/20' 
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${preset.bgColor} ${preset.color}`}>
                  {preset.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold">{preset.name}</h4>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${preset.bgColor} ${preset.color}`}>
                      ~{preset.expectedReduction}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {preset.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Reset Button */}
        <Button variant="ghost" className="gap-2" onClick={onReset}>
          <RotateCcw className="h-4 w-4" />
          Choose Different File
        </Button>
      </div>
    );
  }

  // Error state
  if (state.status === 'error') {
    return (
      <Card className="border-destructive bg-destructive/5 p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-destructive flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <p className="font-semibold text-destructive">Compression Failed</p>
            <p className="text-sm text-muted-foreground">{state.message}</p>
          </div>
        </div>
        <Button variant="outline" className="mt-4 gap-2" onClick={handleRetry}>
          <RotateCcw className="h-4 w-4" />
          Try Again
        </Button>
      </Card>
    );
  }

  // Processing state
  if (state.status === 'processing') {
    return <ProcessingStatus progress={state.progress} fileName={file.name} />;
  }

  // Complete state - show results
  const { result } = state;
  const savingsPercent = ((result.originalSize - result.compressedSize) / result.originalSize * 100).toFixed(1);
  const savedBytes = result.originalSize - result.compressedSize;

  return (
    <div className="space-y-6">
      {/* Success Summary Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Check className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Compression Complete!</h3>
              <p className="text-white/90">
                Your PDF is now {savingsPercent}% smaller
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {/* Size Comparison */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Original Size</p>
              <p className="text-xl font-bold mt-1">{formatFileSize(result.originalSize)}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Compressed Size</p>
              <p className="text-xl font-bold mt-1 text-green-600 dark:text-green-400">
                {formatFileSize(result.compressedSize)}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-100 dark:bg-green-900/30">
              <p className="text-sm text-muted-foreground">Space Saved</p>
              <p className="text-xl font-bold mt-1 text-green-600 dark:text-green-400">
                {formatFileSize(savedBytes)}
              </p>
            </div>
          </div>

          {/* Compression Visual */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Compression ratio</span>
              <span className="font-medium">{savingsPercent}% reduction</span>
            </div>
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${100 - parseFloat(savingsPercent)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs mt-1 text-muted-foreground">
              <span>New file size</span>
              <span>Original</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4" />
          Download Compressed PDF
        </Button>
        <Button variant="outline" className="gap-2" onClick={handleRetry}>
          <RotateCcw className="h-4 w-4" />
          Try Different Preset
        </Button>
        <Button variant="ghost" className="gap-2" onClick={onReset}>
          <FileText className="h-4 w-4" />
          Compress Another PDF
        </Button>
      </div>
    </div>
  );
}
