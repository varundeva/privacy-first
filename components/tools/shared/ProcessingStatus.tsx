'use client';

import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { ProgressUpdate } from '@/lib/workers/types';

interface ProcessingStatusProps {
  progress: ProgressUpdate;
  fileName?: string;
}

export function ProcessingStatus({ progress, fileName }: ProcessingStatusProps) {
  const stageIcons = {
    loading: <Loader2 className="h-5 w-5 animate-spin text-blue-500" />,
    processing: <Loader2 className="h-5 w-5 animate-spin text-purple-500" />,
    encoding: <Loader2 className="h-5 w-5 animate-spin text-orange-500" />,
    complete: <CheckCircle2 className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
  };

  const stageColors = {
    loading: 'bg-blue-500',
    processing: 'bg-purple-500', 
    encoding: 'bg-orange-500',
    complete: 'bg-green-500',
    error: 'bg-red-500',
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          {stageIcons[progress.stage]}
          <div className="flex-1">
            <p className="font-medium">{progress.message}</p>
            {fileName && (
              <p className="text-sm text-muted-foreground truncate">{fileName}</p>
            )}
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {progress.percent}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <Progress 
            value={progress.percent} 
            className="h-2"
          />
          <div 
            className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-300 ${stageColors[progress.stage]}`}
            style={{ width: `${progress.percent}%` }}
          />
        </div>

        {/* Stage Indicators */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className={progress.stage === 'loading' ? 'text-blue-500 font-medium' : ''}>
            Load
          </span>
          <span className={progress.stage === 'processing' ? 'text-purple-500 font-medium' : ''}>
            Process
          </span>
          <span className={progress.stage === 'encoding' ? 'text-orange-500 font-medium' : ''}>
            Encode
          </span>
          <span className={progress.stage === 'complete' ? 'text-green-500 font-medium' : ''}>
            Done
          </span>
        </div>
      </div>
    </Card>
  );
}
