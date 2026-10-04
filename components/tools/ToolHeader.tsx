'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, Shield, Zap, Lock, Share2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getCategoryById, ToolCategoryId } from '@/lib/tools-config';

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
  category: propCategory,
  categoryLabel: propCategoryLabel,
}: ToolHeaderProps) {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);

  // Auto-resolve category from URL path if not explicitly passed as prop
  const pathParts = pathname?.split('/').filter(Boolean) || [];
  const resolvedCategory = propCategory || (pathParts[0] === 'tools' && pathParts[1] ? pathParts[1] : undefined);
  const resolvedCategoryLabel =
    propCategoryLabel ||
    (resolvedCategory ? getCategoryById(resolvedCategory as ToolCategoryId)?.label : undefined);

  const handleShare = async () => {
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback silent fail
    }
  };

  return (
    <header className="border-b bg-gradient-to-b from-card to-background">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation & Actions */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground flex-wrap" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 flex-wrap">
              <li>
                <Link
                  href="/"
                  className="hover:text-foreground transition-colors"
                >
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-muted-foreground/50">/</li>
              <li>
                <Link
                  href="/tools"
                  className="hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  <span>All Tools</span>
                </Link>
              </li>
              {resolvedCategory && resolvedCategoryLabel && (
                <>
                  <li aria-hidden="true" className="text-muted-foreground/50">/</li>
                  <li>
                    <Link
                      href={`/tools/${resolvedCategory}`}
                      className="hover:text-foreground transition-colors"
                    >
                      {resolvedCategoryLabel}
                    </Link>
                  </li>
                </>
              )}
              <li aria-hidden="true" className="text-muted-foreground/50">/</li>
              <li>
                <span className="text-foreground font-medium truncate max-w-[180px] sm:max-w-none inline-block" aria-current="page">
                  {title}
                </span>
              </li>
            </ol>
          </nav>

          {/* Quick Share / Copy URL button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 flex-shrink-0"
            aria-label="Share tool link"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-500" />
                <span className="text-green-600 dark:text-green-400 font-medium">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Share</span>
              </>
            )}
          </Button>
        </div>

        {/* Main Heading Section */}
        <div className="space-y-4">
          {/* Tool Title - H1 for SEO */}
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-balance">
            {title}
          </h1>

          {/* Primary Description - Important for SEO */}
          <p className="text-base sm:text-lg text-muted-foreground text-balance leading-relaxed">
            {description}
          </p>

          {/* Trust Badges - Keywords for SEO */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2">
            <Badge variant="secondary" className="gap-1.5 py-1.5 px-3 text-xs">
              <Shield className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
              <span>100% Private (In-Browser)</span>
            </Badge>
            <Badge variant="secondary" className="gap-1.5 py-1.5 px-3 text-xs">
              <Zap className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
              <span>Instant Web Worker Speed</span>
            </Badge>
            <Badge variant="secondary" className="gap-1.5 py-1.5 px-3 text-xs">
              <Lock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>Zero Server Upload</span>
            </Badge>
          </div>

          {/* AI SEO Extractable Definition Block */}
          <div className="rounded-lg border bg-muted/40 p-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">{title}</span> by Privacy-First Toolbox is a 100% free, client-side browser utility. It processes your files locally on your computer or smartphone using HTML5 and Web Workers—zero bytes of your files or data are ever uploaded to any external server.
          </div>
        </div>
      </div>
    </header>
  );
}
