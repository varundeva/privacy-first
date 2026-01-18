'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ToolHeaderProps {
  title: string;
  description: string;
  showBackButton?: boolean;
}

export function ToolHeader({
  title,
  description,
  showBackButton = true,
}: ToolHeaderProps) {
  return (
    <div className="border-b bg-card">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {showBackButton && (
          <Link href="/" className="mb-4 inline-block">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Tools
            </Button>
          </Link>
        )}
        <h1 className="text-3xl font-bold text-balance">{title}</h1>
        <p className="mt-2 text-muted-foreground text-balance">
          {description}
        </p>
      </div>
    </div>
  );
}
