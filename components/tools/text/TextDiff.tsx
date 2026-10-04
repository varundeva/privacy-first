'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ToolHeader } from '../ToolHeader';
import {
  Check,
  HelpCircle,
  Lightbulb,
  GitCompare,
  Copy,
  RotateCcw,
  Maximize2,
  Minimize2,
  Columns,
  Rows,
  ArrowLeftRight,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import * as Diff from 'diff';

interface TextDiffProps {
  title: string;
  description: string;
  features?: string[];
  useCases?: string[];
  faq?: { question: string; answer: string }[];
  category?: string;
  categoryLabel?: string;
}

interface SplitDiffRow {
  left?: {
    num: number;
    value: string;
    type: 'removed' | 'same' | 'modified';
  };
  right?: {
    num: number;
    value: string;
    type: 'added' | 'same' | 'modified';
  };
}

interface UnifiedDiffLine {
  type: 'added' | 'removed' | 'same';
  lineNumLeft?: number;
  lineNumRight?: number;
  value: string;
}

const SAMPLE_LEFT = `function calculateTotal(items, discountRate) {
  let subtotal = 0;
  for (let i = 0; i < items.length; i++) {
    subtotal += items[i].price;
  }
  const tax = subtotal * 0.08;
  return (subtotal - (subtotal * discountRate)) + tax;
}`;

const SAMPLE_RIGHT = `function calculateTotal(items, discountRate = 0, taxRate = 0.08) {
  // Use modern reduce with item quantity support
  const subtotal = items.reduce((acc, item) => {
    const qty = item.quantity || 1;
    return acc + (item.price * qty);
  }, 0);

  const discountAmount = subtotal * Math.max(0, Math.min(1, discountRate));
  const taxableAmount = subtotal - discountAmount;
  const tax = taxableAmount * taxRate;

  return Math.round((taxableAmount + tax) * 100) / 100;
}`;

export function TextDiff({
  title,
  description,
  features,
  useCases,
  faq,
  category,
  categoryLabel,
}: TextDiffProps) {
  const [leftText, setLeftText] = useState('');
  const [rightText, setRightText] = useState('');
  const [splitRows, setSplitRows] = useState<SplitDiffRow[]>([]);
  const [unifiedLines, setUnifiedLines] = useState<UnifiedDiffLine[]>([]);
  const [stats, setStats] = useState({ additions: 0, deletions: 0, unchanged: 0 });
  const [showDiff, setShowDiff] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedSide, setCopiedSide] = useState<'left' | 'right' | null>(null);

  // Listen for Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const computeDiff = useCallback(() => {
    const changes = Diff.diffLines(leftText, rightText);

    // 1. Build Split (Side-by-Side) Rows
    const newSplitRows: SplitDiffRow[] = [];
    let leftLineNum = 1;
    let rightLineNum = 1;
    let additions = 0;
    let deletions = 0;
    let unchanged = 0;

    let i = 0;
    while (i < changes.length) {
      const change = changes[i];
      const lines = change.value.replace(/\n$/, '').split('\n');

      if (change.added) {
        lines.forEach((line) => {
          newSplitRows.push({
            right: { num: rightLineNum++, value: line, type: 'added' },
          });
          additions++;
        });
        i++;
      } else if (change.removed) {
        const nextChange = changes[i + 1];

        if (nextChange && nextChange.added) {
          const removedLines = lines;
          const addedLines = nextChange.value.replace(/\n$/, '').split('\n');
          const commonLength = Math.min(removedLines.length, addedLines.length);

          for (let k = 0; k < commonLength; k++) {
            newSplitRows.push({
              left: { num: leftLineNum++, value: removedLines[k], type: 'modified' },
              right: { num: rightLineNum++, value: addedLines[k], type: 'modified' },
            });
            deletions++;
            additions++;
          }

          for (let k = commonLength; k < removedLines.length; k++) {
            newSplitRows.push({
              left: { num: leftLineNum++, value: removedLines[k], type: 'removed' },
            });
            deletions++;
          }

          for (let k = commonLength; k < addedLines.length; k++) {
            newSplitRows.push({
              right: { num: rightLineNum++, value: addedLines[k], type: 'added' },
            });
            additions++;
          }

          i += 2;
        } else {
          lines.forEach((line) => {
            newSplitRows.push({
              left: { num: leftLineNum++, value: line, type: 'removed' },
            });
            deletions++;
          });
          i++;
        }
      } else {
        lines.forEach((line) => {
          newSplitRows.push({
            left: { num: leftLineNum++, value: line, type: 'same' },
            right: { num: rightLineNum++, value: line, type: 'same' },
          });
          unchanged++;
        });
        i++;
      }
    }

    // 2. Build Unified (Line-by-Line) Rows
    const newUnifiedLines: UnifiedDiffLine[] = [];
    let uLeft = 1;
    let uRight = 1;

    changes.forEach((change) => {
      const lines = change.value.replace(/\n$/, '').split('\n');
      lines.forEach((line) => {
        if (change.added) {
          newUnifiedLines.push({
            type: 'added',
            lineNumRight: uRight++,
            value: line,
          });
        } else if (change.removed) {
          newUnifiedLines.push({
            type: 'removed',
            lineNumLeft: uLeft++,
            value: line,
          });
        } else {
          newUnifiedLines.push({
            type: 'same',
            lineNumLeft: uLeft++,
            lineNumRight: uRight++,
            value: line,
          });
        }
      });
    });

    setSplitRows(newSplitRows);
    setUnifiedLines(newUnifiedLines);
    setStats({ additions, deletions, unchanged });
    setShowDiff(true);
  }, [leftText, rightText]);

  const reset = () => {
    setLeftText('');
    setRightText('');
    setSplitRows([]);
    setUnifiedLines([]);
    setShowDiff(false);
  };

  const swapInputs = () => {
    setLeftText(rightText);
    setRightText(leftText);
    if (showDiff) {
      setTimeout(() => computeDiff(), 0);
    }
  };

  const loadSample = () => {
    setLeftText(SAMPLE_LEFT);
    setRightText(SAMPLE_RIGHT);
  };

  const copyToClipboard = async (text: string, side: 'left' | 'right') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSide(side);
      setTimeout(() => setCopiedSide(null), 1800);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Diff Workspace JSX
  const diffWorkspace = (
    <div
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 bg-background flex flex-col p-4 sm:p-6 overflow-y-auto space-y-4'
          : 'space-y-6'
      }
    >
      {/* Top Workspace Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 p-3 rounded-xl border border-border/60">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Compare Button */}
          <Button
            onClick={computeDiff}
            disabled={!leftText && !rightText}
            size="sm"
            className="gap-1.5 font-medium"
          >
            <GitCompare className="h-4 w-4" />
            <span>Compare Texts</span>
          </Button>

          {/* Swap Sides */}
          <Button
            variant="outline"
            size="sm"
            onClick={swapInputs}
            disabled={!leftText && !rightText}
            className="gap-1.5 text-xs h-9"
            title="Swap Original and Modified text"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Swap</span>
          </Button>

          {/* Sample Data */}
          <Button
            variant="ghost"
            size="sm"
            onClick={loadSample}
            className="gap-1.5 text-xs h-9 text-muted-foreground hover:text-foreground"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Load Sample</span>
          </Button>

          {/* Reset */}
          {(leftText || rightText) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              className="gap-1.5 text-xs h-9 text-muted-foreground hover:text-destructive"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </Button>
          )}
        </div>

        {/* View Mode & Space Expanding Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Split vs Unified Toggle (When Diff is active) */}
          {showDiff && (
            <div className="inline-flex rounded-lg border bg-background p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                  viewMode === 'split'
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Columns className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Split</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('unified')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                  viewMode === 'unified'
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Rows className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Unified</span>
              </button>
            </div>
          )}

          {/* Fullscreen Toggle */}
          <Button
            variant={isFullscreen ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="gap-1.5 text-xs h-9 font-medium"
            title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Expand to Fullscreen workspace'}
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
            {isFullscreen && (
              <kbd className="hidden sm:inline-block px-1 py-0.2 rounded bg-primary-foreground/20 text-[10px]">
                ESC
              </kbd>
            )}
          </Button>
        </div>
      </div>

      {/* Input Section (Hidden in Fullscreen if Diff is shown, or stacked) */}
      <div className={`grid gap-4 md:grid-cols-2 ${isFullscreen && showDiff ? 'hidden' : ''}`}>
        {/* Left Text */}
        <Card className="p-4 flex flex-col">
          <div className="space-y-3 flex-1 flex flex-col">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-sm">Original Text</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono">
                  {leftText.length} chars
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => copyToClipboard(leftText, 'left')}
                >
                  {copiedSide === 'left' ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  {copiedSide === 'left' ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>
            <Textarea
              placeholder="Paste or type original text here..."
              className={`font-mono text-sm resize-y whitespace-pre leading-relaxed ${
                isFullscreen ? 'flex-1 min-h-[300px]' : 'min-h-[380px]'
              }`}
              value={leftText}
              onChange={(e) => setLeftText(e.target.value)}
            />
          </div>
        </Card>

        {/* Right Text */}
        <Card className="p-4 flex flex-col">
          <div className="space-y-3 flex-1 flex flex-col">
            <div className="flex items-center justify-between">
              <Label className="font-semibold text-sm">Modified Text</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono">
                  {rightText.length} chars
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => copyToClipboard(rightText, 'right')}
                >
                  {copiedSide === 'right' ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  {copiedSide === 'right' ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>
            <Textarea
              placeholder="Paste or type modified text here..."
              className={`font-mono text-sm resize-y whitespace-pre leading-relaxed ${
                isFullscreen ? 'flex-1 min-h-[300px]' : 'min-h-[380px]'
              }`}
              value={rightText}
              onChange={(e) => setRightText(e.target.value)}
            />
          </div>
        </Card>
      </div>

      {/* Diff Results */}
      {showDiff && (
        <div className={`space-y-4 ${isFullscreen ? 'flex-1 flex flex-col min-h-0' : ''}`}>
          {/* Comparison Summary Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3 rounded-lg border">
            <div className="flex items-center gap-2">
              <GitCompare className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Comparison Results</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="px-2.5 py-1 rounded-md bg-green-500/10 text-green-700 dark:text-green-300 font-mono">
                +{stats.additions} added
              </span>
              <span className="px-2.5 py-1 rounded-md bg-red-500/10 text-red-700 dark:text-red-300 font-mono">
                -{stats.deletions} removed
              </span>
              <span className="px-2.5 py-1 rounded-md bg-muted text-muted-foreground font-mono">
                {stats.unchanged} unchanged
              </span>
            </div>
          </div>

          {/* SPLIT VIEW (Side-by-Side) */}
          {viewMode === 'split' && (
            <Card
              className={`p-0 overflow-hidden border shadow-sm ${
                isFullscreen ? 'flex-1 flex flex-col min-h-0' : ''
              }`}
            >
              <div className="bg-muted/60 border-b p-2.5 font-semibold text-xs text-muted-foreground flex items-center">
                <span className="flex-1 text-center">Original Text</span>
                <span className="w-px h-4 bg-border mx-2" />
                <span className="flex-1 text-center">Modified Text</span>
              </div>

              <div
                className={`font-mono text-xs overflow-x-auto ${
                  isFullscreen ? 'flex-1 overflow-y-auto' : 'max-h-[750px] overflow-y-auto'
                }`}
              >
                <div className="min-w-[650px] sm:min-w-[800px] w-full">
                  {splitRows.map((row, idx) => (
                    <div key={idx} className="flex border-b last:border-0 hover:bg-muted/30 group">
                      {/* LEFT SIDE */}
                      <div
                        className={`flex-1 flex min-w-0 ${
                          row.left?.type === 'removed'
                            ? 'bg-[#ffebe9] dark:bg-[#3e1f1f]/80'
                            : row.left?.type === 'modified'
                            ? 'bg-[#fff5b1] dark:bg-[#423818]/80'
                            : ''
                        }`}
                      >
                        <div className="w-12 px-2 py-1 text-right text-muted-foreground select-none border-r bg-muted/20 text-[10px] leading-5 shrink-0">
                          {row.left?.num || ''}
                        </div>
                        <div className="flex-1 px-3 py-1 whitespace-pre-wrap break-all leading-5">
                          {row.left?.type === 'removed' && (
                            <span className="select-none text-red-600 dark:text-red-400 mr-2 font-bold">
                              -
                            </span>
                          )}
                          <span
                            className={
                              row.left?.type === 'removed' ? 'text-red-950 dark:text-red-200' : ''
                            }
                          >
                            {row.left?.value}
                          </span>
                        </div>
                      </div>

                      {/* CENTER DIVIDER */}
                      <div className="w-px bg-border shrink-0" />

                      {/* RIGHT SIDE */}
                      <div
                        className={`flex-1 flex min-w-0 ${
                          row.right?.type === 'added'
                            ? 'bg-[#e6ffec] dark:bg-[#1a3d24]/80'
                            : row.right?.type === 'modified'
                            ? 'bg-[#fff5b1] dark:bg-[#423818]/80'
                            : ''
                        }`}
                      >
                        <div className="w-12 px-2 py-1 text-right text-muted-foreground select-none border-r bg-muted/20 text-[10px] leading-5 shrink-0">
                          {row.right?.num || ''}
                        </div>
                        <div className="flex-1 px-3 py-1 whitespace-pre-wrap break-all leading-5">
                          {row.right?.type === 'added' && (
                            <span className="select-none text-green-600 dark:text-green-400 mr-2 font-bold">
                              +
                            </span>
                          )}
                          <span
                            className={
                              row.right?.type === 'added' ? 'text-green-950 dark:text-green-200' : ''
                            }
                          >
                            {row.right?.value}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* UNIFIED VIEW (Single Column Inline) */}
          {viewMode === 'unified' && (
            <Card
              className={`p-0 overflow-hidden border shadow-sm ${
                isFullscreen ? 'flex-1 flex flex-col min-h-0' : ''
              }`}
            >
              <div className="bg-muted/60 border-b p-2.5 font-semibold text-xs text-muted-foreground flex items-center justify-between">
                <span>Unified Diff Stream</span>
                <span className="text-[11px] font-mono">Lines marked with + and -</span>
              </div>

              <div
                className={`font-mono text-xs overflow-x-auto ${
                  isFullscreen ? 'flex-1 overflow-y-auto' : 'max-h-[750px] overflow-y-auto'
                }`}
              >
                <div className="min-w-full w-full">
                  {unifiedLines.map((line, idx) => (
                    <div
                      key={idx}
                      className={`flex border-b last:border-0 hover:bg-muted/30 leading-5 ${
                        line.type === 'added'
                          ? 'bg-[#e6ffec] dark:bg-[#1a3d24]/80'
                          : line.type === 'removed'
                          ? 'bg-[#ffebe9] dark:bg-[#3e1f1f]/80'
                          : ''
                      }`}
                    >
                      {/* Left line num */}
                      <div className="w-12 px-2 py-1 text-right text-muted-foreground select-none border-r bg-muted/20 text-[10px] shrink-0">
                        {line.lineNumLeft || ''}
                      </div>
                      {/* Right line num */}
                      <div className="w-12 px-2 py-1 text-right text-muted-foreground select-none border-r bg-muted/20 text-[10px] shrink-0">
                        {line.lineNumRight || ''}
                      </div>
                      {/* Sign */}
                      <div className="w-6 text-center py-1 select-none font-bold shrink-0">
                        {line.type === 'added' && (
                          <span className="text-green-600 dark:text-green-400">+</span>
                        )}
                        {line.type === 'removed' && (
                          <span className="text-red-600 dark:text-red-400">-</span>
                        )}
                      </div>
                      {/* Content */}
                      <div
                        className={`flex-1 px-2 py-1 whitespace-pre-wrap break-all ${
                          line.type === 'added'
                            ? 'text-green-950 dark:text-green-200'
                            : line.type === 'removed'
                            ? 'text-red-950 dark:text-red-200'
                            : ''
                        }`}
                      >
                        {line.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Tool Header */}
      <ToolHeader
        title={title}
        description={description}
        category={category}
        categoryLabel={categoryLabel}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto px-4 py-8 sm:px-6 w-full max-w-[96%] xl:max-w-[94%] 2xl:max-w-[1700px] space-y-8">
        {diffWorkspace}

        {/* Features & FAQ Section */}
        {((features && features.length > 0) ||
          (useCases && useCases.length > 0) ||
          (faq && faq.length > 0)) && (
          <div className="grid gap-8 pt-8 border-t">
            {/* Features & Use Cases Grid */}
            <div className="grid gap-8 md:grid-cols-2">
              {/* Features */}
              {features && features.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Check className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-semibold">Key Features</h2>
                  </div>
                  <Card className="p-6">
                    <ul className="space-y-3">
                      {features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3 text-muted-foreground">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              )}

              {/* Use Cases */}
              {useCases && useCases.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                      <Lightbulb className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-semibold">Common Use Cases</h2>
                  </div>
                  <Card className="p-6">
                    <ul className="space-y-3">
                      {useCases.map((useCase, index) => (
                        <li key={index} className="flex items-start gap-3 text-muted-foreground">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                          <span>{useCase}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              )}
            </div>

            {/* FAQ Section */}
            {faq && faq.length > 0 && (
              <div className="space-y-6 max-w-3xl mx-auto w-full">
                <div className="flex items-center gap-2 justify-center pb-2">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-semibold text-center">Frequently Asked Questions</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  {faq.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left font-medium">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </div>
        )}
      </main>


      {/* Privacy Guarantee Banner */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 w-full text-center border-t border-dashed mt-8">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-muted/50 text-sm text-muted-foreground">
          <span>🔒</span>
          <span>100% Client-Side: Your code and text diffs never leave your device.</span>
        </div>
      </div>
    </div>
  );
}
