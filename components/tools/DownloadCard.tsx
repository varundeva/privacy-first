'use client';

import { Download, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DownloadCardProps {
  fileName: string;
  fileSize: string;
  fileUrl: string;
  mimeType: string;
  onDownload?: () => void;
}

export function DownloadCard({
  fileName,
  fileSize,
  fileUrl,
  mimeType,
  onDownload,
}: DownloadCardProps) {
  const [copied, setCopied] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onDownload?.();
  };

  const handleCopy = async () => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [mimeType]: blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Card className="space-y-4 p-6">
      <div>
        <h3 className="font-semibold">Download Ready!</h3>
        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
          <p>File: {fileName}</p>
          <p>Size: {fileSize}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleDownload} className="flex-1 gap-2">
          <Download className="h-4 w-4" />
          Download
        </Button>
        <Button
          variant="outline"
          onClick={handleCopy}
          className="gap-2 bg-transparent"
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </Card>
  );
}
