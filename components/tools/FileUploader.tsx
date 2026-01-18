'use client';

import React from "react"

import { useState, useCallback } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
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
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File) => {
      // Check file type
      const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
      if (!acceptedFormats.includes(fileExtension)) {
        setError(
          `Invalid file type. Accepted formats: ${acceptedFormats.join(', ')}`
        );
        return false;
      }

      // Check file size
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > maxFileSize) {
        setError(`File size must be less than ${maxFileSize}MB`);
        return false;
      }

      setError(null);
      return true;
    },
    [acceptedFormats, maxFileSize]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
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

  return (
    <div className="w-full space-y-4">
      <Card
        className={`relative border-2 border-dashed p-8 text-center transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        } ${isProcessing ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileInput}
          disabled={isProcessing}
          className="hidden"
          id="file-input"
        />
        <label htmlFor="file-input" className="block cursor-pointer space-y-4">
          <div className="flex justify-center">
            <Upload className="h-12 w-12 text-muted-foreground" />
          </div>
          <div>
            <p className="text-lg font-semibold">
              {isDragging ? 'Drop your file here' : 'Drop your file or click to browse'}
            </p>
            <p className="text-sm text-muted-foreground">
              Formats: {acceptedFormats.join(', ')} • Max size: {maxFileSize}MB
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="inline-block h-px w-8 bg-muted-foreground/25" />
            <span>Your file never leaves your device</span>
            <span className="inline-block h-px w-8 bg-muted-foreground/25" />
          </div>
        </label>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
