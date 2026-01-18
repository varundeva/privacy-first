'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileImage, HardDrive, Maximize2 } from 'lucide-react';
import { DownloadCard } from './DownloadCard';
import { useFile } from '@/lib/FileContext';

interface ImageMetadata {
  name: string;
  size: string;
  sizeBytes: number;
  width: number;
  height: number;
  format: string;
}

export function ImageConverter() {
  const { selectedFile: file } = useFile();
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<string>('');
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [originalMetadata, setOriginalMetadata] = useState<ImageMetadata | null>(null);
  const [convertedMetadata, setConvertedMetadata] = useState<ImageMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      return;
    }

    const processImage = async () => {
      try {
        setIsProcessing(true);
        setError(null);
        setDownloadUrl('');
        setConvertedMetadata(null);

        // Read the file as data URL for preview
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const dataUrl = e.target?.result as string;
            setPreview(dataUrl);

            // Create canvas and convert image
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              try {
                // Get original file metadata
                const originalMeta: ImageMetadata = {
                  name: file.name,
                  size: `${(file.size / 1024).toFixed(2)} KB`,
                  sizeBytes: file.size,
                  width: img.width,
                  height: img.height,
                  format: 'JPG',
                };
                setOriginalMetadata(originalMeta);

                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                  setError('Failed to get canvas context');
                  setIsProcessing(false);
                  return;
                }

                // Draw image on canvas with white background to handle transparency
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);

                // Convert to PNG blob
                canvas.toBlob(
                  (blob) => {
                    if (!blob) {
                      setError('Failed to convert image');
                      setIsProcessing(false);
                      return;
                    }

                    // Create download URL
                    const url = URL.createObjectURL(blob);
                    setDownloadUrl(url);

                    // Set converted file info
                    const baseName = file.name.replace(/\.[^.]*$/, '');
                    const convertedMeta: ImageMetadata = {
                      name: `${baseName}.png`,
                      size: `${(blob.size / 1024).toFixed(2)} KB`,
                      sizeBytes: blob.size,
                      width: img.width,
                      height: img.height,
                      format: 'PNG',
                    };
                    setConvertedMetadata(convertedMeta);

                    setIsProcessing(false);
                  },
                  'image/png',
                  1.0
                );
              } catch (err) {
                console.error('[v0] Canvas processing error:', err);
                setError('Failed to process image');
                setIsProcessing(false);
              }
            };
            img.onerror = () => {
              console.error('[v0] Image load error');
              setError('Failed to load image. Please try another file.');
              setIsProcessing(false);
            };
            img.src = dataUrl;
          } catch (err) {
            console.error('[v0] Reader onload error:', err);
            setError('Failed to process file');
            setIsProcessing(false);
          }
        };
        reader.onerror = () => {
          console.error('[v0] File read error');
          setError('Failed to read file');
          setIsProcessing(false);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error('[v0] Processing error:', err);
        setError('An error occurred during conversion');
        setIsProcessing(false);
      }
    };

    processImage();

    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [file, downloadUrl]);

  if (error) {
    return (
      <Card className="border-destructive bg-destructive/5 p-6 text-destructive">
        <p className="font-semibold">Conversion Error</p>
        <p className="mt-2 text-sm">{error}</p>
      </Card>
    );
  }

  if (isProcessing) {
    return (
      <Card className="flex items-center justify-center gap-3 p-12">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-muted-foreground">Converting image...</span>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Preview Section */}
      {preview && (
        <Card className="overflow-hidden p-6">
          <h3 className="mb-4 font-semibold">Preview</h3>
          <div className="flex items-center justify-center rounded-lg bg-muted p-6">
            <img
              src={preview || "/placeholder.svg"}
              alt="Image preview"
              className="max-h-96 w-auto rounded"
            />
          </div>
        </Card>
      )}

      {/* Metadata Comparison Section */}
      {originalMetadata && convertedMetadata && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Original Metadata */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <FileImage className="h-5 w-5 text-blue-500" />
              <h4 className="font-semibold">Original JPG</h4>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Format:</span>
                <span className="font-medium">{originalMetadata.format}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">File Name:</span>
                <span className="truncate font-medium">{originalMetadata.name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Size:</span>
                <span className="font-medium">{originalMetadata.size}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-muted-foreground">Dimensions:</span>
                <span className="font-medium">
                  {originalMetadata.width}x{originalMetadata.height}px
                </span>
              </div>
            </div>
          </Card>

          {/* Converted Metadata */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <FileImage className="h-5 w-5 text-green-500" />
              <h4 className="font-semibold">Converted PNG</h4>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Format:</span>
                <span className="font-medium">{convertedMetadata.format}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">File Name:</span>
                <span className="truncate font-medium">{convertedMetadata.name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Size:</span>
                <span className="font-medium">{convertedMetadata.size}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-muted-foreground">Dimensions:</span>
                <span className="font-medium">
                  {convertedMetadata.width}x{convertedMetadata.height}px
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Size Comparison Info */}
      {originalMetadata && convertedMetadata && (
        <Card className="bg-muted/50 p-4">
          <div className="flex items-center gap-2 text-sm">
            <HardDrive className="h-4 w-4" />
            <div>
              <span className="font-medium">Size Change: </span>
              <span className="text-muted-foreground">
                {originalMetadata.sizeBytes > convertedMetadata.sizeBytes ? (
                  <span className="text-green-600">
                    Reduced by {((1 - convertedMetadata.sizeBytes / originalMetadata.sizeBytes) * 100).toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-amber-600">
                    Increased by {((convertedMetadata.sizeBytes / originalMetadata.sizeBytes - 1) * 100).toFixed(1)}%
                  </span>
                )}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Download Section */}
      {downloadUrl && convertedMetadata && (
        <DownloadCard
          fileName={convertedMetadata.name}
          fileSize={convertedMetadata.size}
          fileUrl={downloadUrl}
          mimeType="image/png"
        />
      )}
    </div>
  );
}
