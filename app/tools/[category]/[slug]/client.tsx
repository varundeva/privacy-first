'use client';

import { ToolShell } from '@/components/tools/ToolShell';
import { JpgToPngConverter } from '@/components/tools/image/JpgToPngConverter';

interface ToolPageClientProps {
  toolId: string;
  title: string;
  description: string;
  acceptedFormats: string[];
  maxFileSize: number;
}

/**
 * Tool Page Client Component
 * 
 * This component handles the client-side rendering of tool pages.
 * It maps tool IDs to their respective components.
 * 
 * To add a new tool:
 * 1. Import the tool component
 * 2. Add a case in the getToolComponent function
 */
export function ToolPageClient({
  toolId,
  title,
  description,
  acceptedFormats,
  maxFileSize,
}: ToolPageClientProps) {
  return (
    <ToolShell
      title={title}
      description={description}
      acceptedFormats={acceptedFormats}
      maxFileSize={maxFileSize}
    >
      {({ file, onReset }) => {
        // Map tool ID to component
        switch (toolId) {
          case 'jpg-to-png':
            return <JpgToPngConverter file={file} onReset={onReset} />;
          
          // Add more tools here:
          // case 'png-to-jpg':
          //   return <PngToJpgConverter file={file} onReset={onReset} />;
          
          default:
            return (
              <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                Tool component not found for: {toolId}
              </div>
            );
        }
      }}
    </ToolShell>
  );
}
