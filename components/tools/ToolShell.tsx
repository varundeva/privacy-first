'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { ToolHeader } from './ToolHeader';
import { FileUploader } from './FileUploader';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ToolShellProps {
  title: string;
  description: string;
  acceptedFormats: string[];
  maxFileSize: number;
  children: (props: { file: File; onReset: () => void }) => React.ReactNode;
}

/**
 * ToolShell - Container component for all tools
 * 
 * Handles:
 * - File selection and validation
 * - Navigation back to home
 * - Consistent layout across all tools
 * 
 * The tool-specific component receives the file and a reset callback
 */
export function ToolShell({
  title,
  description,
  acceptedFormats,
  maxFileSize,
  children,
}: ToolShellProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
  }, []);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Tool Header */}
      <ToolHeader title={title} description={description} />

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {!selectedFile ? (
          <FileUploader
            acceptedFormats={acceptedFormats}
            maxFileSize={maxFileSize}
            onFileSelect={handleFileSelect}
          />
        ) : (
          children({ file: selectedFile, onReset: handleReset })
        )}
      </main>

      {/* Privacy Footer */}
      <footer className="border-t mt-auto">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          <p className="text-center text-sm text-muted-foreground">
            🔒 This tool processes files entirely in your browser. Your data never leaves your device.
          </p>
        </div>
      </footer>
    </div>
  );
}
