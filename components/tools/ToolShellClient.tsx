'use client';

import React from "react"

import { useState } from 'react';
import { ToolHeader } from './ToolHeader';
import { FileUploader } from './FileUploader';
import { FileProvider } from '@/lib/FileContext';

interface ToolShellClientProps {
  title: string;
  description: string;
  acceptedFormats: string[];
  maxFileSize: number;
  children: React.ReactNode;
}

export function ToolShellClient({
  title,
  description,
  acceptedFormats,
  maxFileSize,
  children,
}: ToolShellClientProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setIsProcessing(true);
  };

  return (
    <FileProvider initialFile={selectedFile}>
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
              {children}
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setIsProcessing(false);
                }}
                className="text-sm text-muted-foreground hover:underline"
              >
                {'← Convert another file'}
              </button>
            </div>
          )}
        </main>
      </div>
    </FileProvider>
  );
}
