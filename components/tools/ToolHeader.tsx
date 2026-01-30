'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Zap, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ToolHeaderProps {
  title: string;
  description: string;
  showBackButton?: boolean;
  category?: string;
  categoryLabel?: string;
}

export function ToolHeader({
  title,
  description,
  showBackButton = true,
  category,
  categoryLabel,
}: ToolHeaderProps) {
  return (
    <header className="border-b bg-gradient-to-b from-card to-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Navigation */}
        <nav className="flex items-center gap-2 mb-6" aria-label="Breadcrumb">
          {showBackButton && (
            <Link href="/tools" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span>All Tools</span>
            </Link>
          )}
          {categoryLabel && (
            <>
              <span className="text-muted-foreground">/</span>
              <Link
                href={`/tools?category=${category}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {categoryLabel}
              </Link>
            </>
          )}
        </nav>

        {/* Main Heading Section */}
        <div className="space-y-4">
          {/* Tool Title - H1 for SEO */}
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-balance">
            {title}
          </h1>

          {/* Primary Description - Important for SEO */}
          <p className="text-lg text-muted-foreground text-balance max-w-2xl">
            {description}
          </p>

          {/* Trust Badges - Keywords for SEO */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
              <Shield className="h-3.5 w-3.5 text-green-600" />
              <span>100% Private</span>
            </Badge>
            <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
              <Zap className="h-3.5 w-3.5 text-yellow-600" />
              <span>Instant Processing</span>
            </Badge>
            <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
              <Lock className="h-3.5 w-3.5 text-blue-600" />
              <span>No Upload Required</span>
            </Badge>
          </div>

          {/* SEO-friendly secondary text */}
          <p className="text-sm text-muted-foreground">
            Free online {title.toLowerCase()} tool. Process your files securely in your browser - your data never leaves your device.
          </p>
        </div>
      </div>
    </header>
  );
}
