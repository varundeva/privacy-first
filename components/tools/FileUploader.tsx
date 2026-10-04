'use client';

import React, { useState, useCallback, useId, useEffect, useRef } from 'react';
import { Upload, AlertCircle, FileUp, Shield, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FileUploaderProps {
  acceptedFormats: string[];
  maxFileSize: number; // in MB
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
}

export function FileUploader({
  acceptedFormats,
  maxFileSize,
  onFileSelect,
  isProcessing = false,
}: FileUploaderProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File) => {
      // Check file type
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      if (!acceptedFormats.includes(fileExtension)) {
        setError(
          `Invalid file format (${fileExtension}). Accepted formats: ${acceptedFormats.join(', ')}`
        );
        return false;
      }

      // Check file size
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > maxFileSize) {
        setError(`File size (${fileSizeInMB.toFixed(1)}MB) exceeds limit of ${maxFileSize}MB`);
        return false;
      }

      setError(null);
      return true;
    },
    [acceptedFormats, maxFileSize]
  );

  // Global paste support (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (isProcessing) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file && validateFile(file)) {
            onFileSelect(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isProcessing, onFileSelect, validateFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.currentTarget.files || []);
    if (files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="w-full space-y-4">
      <Card
        tabIndex={isProcessing ? -1 : 0}
        role="button"
        aria-label={`Upload file. Supported formats: ${acceptedFormats.join(', ')}`}
        onKeyDown={handleKeyDown}
        className={`relative border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary ${
          isDragging
            ? 'border-primary bg-primary/10 scale-[1.01] shadow-xl shadow-primary/10'
            : 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30 bg-card'
        } ${isProcessing ? 'pointer-events-none opacity-50' : 'cursor-pointer group'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileInput}
          disabled={isProcessing}
          className="hidden"
          id={inputId}
        />

        <label htmlFor={inputId} className="block cursor-pointer space-y-5">
          {/* Animated Upload Icon */}
          <div className="flex justify-center">
            <div
              className={`p-4 rounded-2xl transition-all duration-300 ${
                isDragging
                  ? 'bg-primary text-primary-foreground scale-110'
                  : 'bg-primary/10 text-primary group-hover:scale-110 group-hover:bg-primary/20'
              }`}
            >
              <Upload className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <p className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              {isDragging ? 'Release to upload file' : 'Drop your file here, or click to browse'}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Max file size: <span className="font-semibold text-foreground">{maxFileSize}MB</span>. Fast local processing.
            </p>
          </div>

          {/* Formats Pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            {acceptedFormats.map((fmt) => (
              <span
                key={fmt}
                className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-mono text-muted-foreground border border-border/50"
              >
                {fmt}
              </span>
            ))}
          </div>

          {/* Mobile Tap Button */}
          <div className="pt-2">
            <Button
              type="button"
              variant="secondary"
              size="default"
              className="gap-2 pointer-events-none min-h-[44px] px-6 text-sm font-medium shadow-xs"
            >
              <FileUp className="h-4 w-4" />
              <span>Select File from Device</span>
            </Button>
          </div>

          {/* Privacy & Paste Hint */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3 text-xs text-muted-foreground border-t border-border/40 max-w-md mx-auto">
            <div className="inline-flex items-center gap-1.5 text-green-600 dark:text-green-400 font-medium">
              <Shield className="h-3.5 w-3.5" />
              <span>Never leaves your device</span>
            </div>
            <span className="hidden sm:inline text-muted-foreground/40">•</span>
            <div className="inline-flex items-center gap-1">
              <span>Tip: Press</span>
              <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono text-[10px]">⌘V</kbd>
              <span>to paste from clipboard</span>
            </div>
          </div>
        </label>
      </Card>

      {error && (
        <Alert variant="destructive" className="animate-in fade-in-50 duration-200">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
