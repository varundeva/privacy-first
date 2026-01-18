'use client';

import React from "react"

import { useState } from 'react';
import { ToolHeader } from './ToolHeader';
import { FileUploader } from './FileUploader';
import { Loader2 } from 'lucide-react';

interface ToolShellProps {
  title: string;
  description: string;
  acceptedFormats: string[];
  maxFileSize: number;
  children: (file: File | null, isProcessing: boolean) => React.ReactNode;
  onFileSelect?: (file: File) => void;
}

export function ToolShell({
  title,
  description,
  acceptedFormats,
  maxFileSize,
  children,
  onFileSelect,
}: ToolShellProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setIsProcessing(true);
    onFileSelect?.(file);
    // Processing state will be managed by the child component
    setTimeout(() => setIsProcessing(false), 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <ToolHeader title={title} description={description} />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {!selectedFile ? (
          <FileUploader
            acceptedFormats={acceptedFormats}
            maxFileSize={maxFileSize}
            onFileSelect={handleFileSelect}
            isProcessing={isProcessing}
          />
        ) : (
          <div className="space-y-6">
            <div className="rounded-lg border border-muted bg-muted/30 p-4">
              <p className="text-sm">
                <span className="font-semibold">Processing:</span>{' '}
                {selectedFile.name}
              </p>
            </div>
            {children(selectedFile, isProcessing)}
            <button
              onClick={() => {
                setSelectedFile(null);
                setIsProcessing(false);
              }}
              className="text-sm text-muted-foreground hover:underline"
            >
              ← Convert another file
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
