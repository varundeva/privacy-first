'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ToolHeader } from '../ToolHeader';
import {
  Check,
  HelpCircle,
  Lightbulb,
  GitCompare,
  Copy,
  RotateCcw,
  AlertCircle,
  Maximize2,
  Minimize2,
  Columns,
  Rows,
  ArrowLeftRight,
  Sparkles,
  Wand2,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Editor, { OnValidate } from '@monaco-editor/react';
import { DiffEditor } from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import * as Diff from 'diff';

interface JsonComparisonProps {
  title: string;
  description: string;
  features?: string[];
  useCases?: string[];
  faq?: { question: string; answer: string }[];
  category?: string;
  categoryLabel?: string;
}

interface DiffRow {
  left?: {
    key: string;
    value: string;
    type: 'removed' | 'same' | 'modified' | 'missing';
  };
  right?: {
    key: string;
    value: string;
    type: 'added' | 'same' | 'modified' | 'missing';
  };
}

interface LineDiffRow {
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

interface ComparisonStats {
  additions: number;
  deletions: number;
  modifications: number;
  unchanged: number;
  keysOnlyLeft: number;
  keysOnlyRight: number;
}

interface ParseError {
  side: 'left' | 'right';
  message: string;
}

const SAMPLE_LEFT_JSON = JSON.stringify(
  {
    productId: 'prod_9921',
    name: 'Enterprise Cloud Storage',
    tier: 'Standard',
    status: 'active',
    quotaGb: 250,
    pricing: {
      monthly: 19.99,
      annual: 199.99,
      currency: 'USD',
    },
    features: ['Client-side encryption', 'Daily automated backups', 'Standard SLA (99.9%)'],
    metadata: {
      version: 1.2,
      createdAt: '2024-01-10T00:00:00Z',
    },
  },
  null,
  2
);

const SAMPLE_RIGHT_JSON = JSON.stringify(
  {
    productId: 'prod_9921',
    name: 'Enterprise Cloud Storage Pro',
    tier: 'Enterprise',
    status: 'active',
    quotaGb: 1000,
    pricing: {
      monthly: 39.99,
      annual: 399.99,
      currency: 'USD',
      discountEligible: true,
    },
    features: [
      'Zero-knowledge encryption',
      'Continuous real-time backups',
      'High-priority SLA (99.99%)',
      'Dedicated 24/7 technical manager',
    ],
    metadata: {
      version: 2.0,
      createdAt: '2024-01-10T00:00:00Z',
      updatedAt: '2025-06-15T12:00:00Z',
    },
  },
  null,
  2
);

function tryParseJson(text: string): { success: boolean; data?: any; error?: string } {
  if (!text.trim()) {
    return { success: true, data: null };
  }
  try {
    const data = JSON.parse(text);
    return { success: true, data };
  } catch (err) {
    if (err instanceof SyntaxError) {
      return { success: false, error: err.message };
    }
    return { success: false, error: 'Invalid JSON' };
  }
}

function formatJson(text: string): string {
  const parsed = tryParseJson(text);
  if (parsed.success && parsed.data !== null) {
    return JSON.stringify(parsed.data, null, 2);
  }
  return text;
}

function flattenJson(obj: any, prefix: string = ''): Record<string, string> {
  const result: Record<string, string> = {};

  if (obj === null || obj === undefined) {
    result[prefix || 'value'] = String(obj);
    return result;
  }

  if (typeof obj !== 'object') {
    result[prefix || 'value'] = JSON.stringify(obj);
    return result;
  }

  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      const newPrefix = prefix ? `${prefix}[${index}]` : `[${index}]`;
      if (typeof item === 'object' && item !== null) {
        Object.assign(result, flattenJson(item, newPrefix));
      } else {
        result[newPrefix] = JSON.stringify(item);
      }
    });
    return result;
  }

  Object.entries(obj).forEach(([key, value]) => {
    const newPrefix = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenJson(value, newPrefix));
    } else {
      result[newPrefix] = JSON.stringify(value);
    }
  });

  return result;
}

function computeJsonDiff(
  left: string,
  right: string
): { rows: DiffRow[]; stats: ComparisonStats } {
  const leftParsed = tryParseJson(left);
  const rightParsed = tryParseJson(right);

  if (!leftParsed.success || !rightParsed.success) {
    return {
      rows: [],
      stats: {
        additions: 0,
        deletions: 0,
        modifications: 0,
        unchanged: 0,
        keysOnlyLeft: 0,
        keysOnlyRight: 0,
      },
    };
  }

  const leftFlat = flattenJson(leftParsed.data);
  const rightFlat = flattenJson(rightParsed.data);

  const allKeys = Array.from(new Set([...Object.keys(leftFlat), ...Object.keys(rightFlat)])).sort();

  const rows: DiffRow[] = [];
  let additions = 0;
  let deletions = 0;
  let modifications = 0;
  let unchanged = 0;
  let keysOnlyLeft = 0;
  let keysOnlyRight = 0;

  allKeys.forEach((key) => {
    const inLeft = key in leftFlat;
    const inRight = key in rightFlat;
    const leftVal = leftFlat[key];
    const rightVal = rightFlat[key];

    if (inLeft && inRight) {
      if (leftVal === rightVal) {
        rows.push({
          left: { key, value: leftVal, type: 'same' },
          right: { key, value: rightVal, type: 'same' },
        });
        unchanged++;
      } else {
        rows.push({
          left: { key, value: leftVal, type: 'modified' },
          right: { key, value: rightVal, type: 'modified' },
        });
        modifications++;
      }
    } else if (inLeft && !inRight) {
      rows.push({
        left: { key, value: leftVal, type: 'removed' },
        right: { key, value: '', type: 'missing' },
      });
      deletions++;
      keysOnlyLeft++;
    } else {
      rows.push({
        left: { key, value: '', type: 'missing' },
        right: { key, value: rightVal, type: 'added' },
      });
      additions++;
      keysOnlyRight++;
    }
  });

  return {
    rows,
    stats: {
      additions,
      deletions,
      modifications,
      unchanged,
      keysOnlyLeft,
      keysOnlyRight,
    },
  };
}

function computeLineDiff(
  left: string,
  right: string
): { rows: LineDiffRow[]; stats: ComparisonStats } {
  const changes = Diff.diffLines(left, right);

  const newRows: LineDiffRow[] = [];
  let leftLineNum = 1;
  let rightLineNum = 1;
  let additions = 0;
  let deletions = 0;
  let modifications = 0;
  let unchanged = 0;

  let i = 0;
  while (i < changes.length) {
    const change = changes[i];
    const lines = change.value.replace(/\n$/, '').split('\n');

    if (change.added) {
      lines.forEach((line) => {
        newRows.push({
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
          newRows.push({
            left: { num: leftLineNum++, value: removedLines[k], type: 'modified' },
            right: { num: rightLineNum++, value: addedLines[k], type: 'modified' },
          });
          modifications++;
          deletions++;
          additions++;
        }

        for (let k = commonLength; k < removedLines.length; k++) {
          newRows.push({
            left: { num: leftLineNum++, value: removedLines[k], type: 'removed' },
          });
          deletions++;
        }

        for (let k = commonLength; k < addedLines.length; k++) {
          newRows.push({
            right: { num: rightLineNum++, value: addedLines[k], type: 'added' },
          });
          additions++;
        }

        i += 2;
      } else {
        lines.forEach((line) => {
          newRows.push({
            left: { num: leftLineNum++, value: line, type: 'removed' },
          });
          deletions++;
        });
        i++;
      }
    } else {
      lines.forEach((line) => {
        newRows.push({
          left: { num: leftLineNum++, value: line, type: 'same' },
          right: { num: rightLineNum++, value: line, type: 'same' },
        });
        unchanged++;
      });
      i++;
    }
  }

  return {
    rows: newRows,
    stats: {
      additions: additions - modifications,
      deletions: deletions - modifications,
      modifications,
      unchanged,
      keysOnlyLeft: 0,
      keysOnlyRight: 0,
    },
  };
}

export function JsonComparison({
  title,
  description,
  features,
  useCases,
  faq,
  category,
  categoryLabel,
}: JsonComparisonProps) {
  const [leftJson, setLeftJson] = useState('');
  const [rightJson, setRightJson] = useState('');
  const [formattedLeftJson, setFormattedLeftJson] = useState('');
  const [formattedRightJson, setFormattedRightJson] = useState('');
  const [rows, setRows] = useState<DiffRow[]>([]);
  const [lineRows, setLineRows] = useState<LineDiffRow[]>([]);
  const [stats, setStats] = useState<ComparisonStats>({
    additions: 0,
    deletions: 0,
    modifications: 0,
    unchanged: 0,
    keysOnlyLeft: 0,
    keysOnlyRight: 0,
  });
  const [showDiff, setShowDiff] = useState(false);
  const [parseErrors, setParseErrors] = useState<ParseError[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSideBySide, setIsSideBySide] = useState(true);
  const [editorHeightMode, setEditorHeightMode] = useState<'standard' | 'tall' | 'max'>('standard');
  const [copiedSide, setCopiedSide] = useState<'left' | 'right' | null>(null);

  const { theme } = useTheme();
  const editorTheme = theme === 'dark' ? 'vs-dark' : 'light';

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

  const handleLeftValidate: OnValidate = useCallback((markers) => {
    const errors = markers.filter((m) => m.severity === 8);
    if (errors.length > 0) {
      setParseErrors((prev) => [
        ...prev.filter((e) => e.side !== 'left'),
        { side: 'left', message: errors[0].message + ` (Line ${errors[0].startLineNumber})` },
      ]);
    } else {
      setParseErrors((prev) => prev.filter((e) => e.side !== 'left'));
    }
  }, []);

  const handleRightValidate: OnValidate = useCallback((markers) => {
    const errors = markers.filter((m) => m.severity === 8);
    if (errors.length > 0) {
      setParseErrors((prev) => [
        ...prev.filter((e) => e.side !== 'right'),
        { side: 'right', message: errors[0].message + ` (Line ${errors[0].startLineNumber})` },
      ]);
    } else {
      setParseErrors((prev) => prev.filter((e) => e.side !== 'right'));
    }
  }, []);

  const validateAndCompare = useCallback(() => {
    const errors: ParseError[] = [];

    const leftParsed = tryParseJson(leftJson);
    const rightParsed = tryParseJson(rightJson);

    if (!leftParsed.success && leftJson.trim()) {
      errors.push({ side: 'left', message: leftParsed.error || 'Invalid JSON' });
    }
    if (!rightParsed.success && rightJson.trim()) {
      errors.push({ side: 'right', message: rightParsed.error || 'Invalid JSON' });
    }

    setParseErrors(errors);

    if (errors.length === 0) {
      // Format JSON for better diff display
      const formatted_left = formatJson(leftJson);
      const formatted_right = formatJson(rightJson);

      setFormattedLeftJson(formatted_left);
      setFormattedRightJson(formatted_right);

      // Compute line-by-line diff
      const { rows: lineDiffRows, stats: lineDiffStats } = computeLineDiff(
        formatted_left,
        formatted_right
      );
      setLineRows(lineDiffRows);

      // Compute key-by-key diff
      const { rows: keyDiffRows } = computeJsonDiff(leftJson, rightJson);
      setRows(keyDiffRows);

      // Use line diff stats for display
      setStats(lineDiffStats);
      setShowDiff(true);
    }
  }, [leftJson, rightJson]);

  const reset = () => {
    setLeftJson('');
    setRightJson('');
    setFormattedLeftJson('');
    setFormattedRightJson('');
    setRows([]);
    setLineRows([]);
    setShowDiff(false);
    setParseErrors([]);
  };

  const swapInputs = () => {
    setLeftJson(rightJson);
    setRightJson(leftJson);
    if (showDiff) {
      setTimeout(() => validateAndCompare(), 0);
    }
  };

  const prettifyBoth = () => {
    const pLeft = tryParseJson(leftJson);
    const pRight = tryParseJson(rightJson);
    if (pLeft.success && pLeft.data !== null) {
      setLeftJson(JSON.stringify(pLeft.data, null, 2));
    }
    if (pRight.success && pRight.data !== null) {
      setRightJson(JSON.stringify(pRight.data, null, 2));
    }
  };

  const loadSample = () => {
    setLeftJson(SAMPLE_LEFT_JSON);
    setRightJson(SAMPLE_RIGHT_JSON);
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

  const getInputEditorHeight = () => {
    if (isFullscreen) return 'calc(100vh - 280px)';
    if (editorHeightMode === 'max') return '650px';
    if (editorHeightMode === 'tall') return '520px';
    return '420px';
  };

  const getDiffEditorHeight = () => {
    if (isFullscreen) return 'calc(100vh - 220px)';
    if (editorHeightMode === 'max') return '850px';
    if (editorHeightMode === 'tall') return '720px';
    return '600px';
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
      {/* Workspace Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 p-3 rounded-xl border border-border/60">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Compare Button */}
          <Button
            onClick={validateAndCompare}
            disabled={!leftJson.trim() && !rightJson.trim()}
            size="sm"
            className="gap-1.5 font-medium"
          >
            <GitCompare className="h-4 w-4" />
            <span>Compare JSON</span>
          </Button>

          {/* Swap Sides */}
          <Button
            variant="outline"
            size="sm"
            onClick={swapInputs}
            disabled={!leftJson.trim() && !rightJson.trim()}
            className="gap-1.5 text-xs h-9"
            title="Swap Original and Modified JSON"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Swap</span>
          </Button>

          {/* Prettify Inputs */}
          <Button
            variant="ghost"
            size="sm"
            onClick={prettifyBoth}
            disabled={!leftJson.trim() && !rightJson.trim()}
            className="gap-1.5 text-xs h-9 text-muted-foreground hover:text-foreground"
            title="Format both JSON inputs with 2-space indentation"
          >
            <Wand2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Beautify</span>
          </Button>

          {/* Load Sample */}
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
          {(leftJson || rightJson) && (
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
          {/* Side-by-Side vs Inline Diff Toggle (Monaco option) */}
          {showDiff && (
            <div className="inline-flex rounded-lg border bg-background p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setIsSideBySide(true)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                  isSideBySide
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Split Side-by-Side View"
              >
                <Columns className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Split</span>
              </button>
              <button
                type="button"
                onClick={() => setIsSideBySide(false)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                  !isSideBySide
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Inline Unified View"
              >
                <Rows className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Inline</span>
              </button>
            </div>
          )}

          {/* Height Selector (In standard mode) */}
          {!isFullscreen && (
            <div className="hidden lg:inline-flex rounded-lg border bg-background p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setEditorHeightMode('standard')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  editorHeightMode === 'standard'
                    ? 'bg-muted text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Std
              </button>
              <button
                type="button"
                onClick={() => setEditorHeightMode('tall')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  editorHeightMode === 'tall'
                    ? 'bg-muted text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Tall
              </button>
              <button
                type="button"
                onClick={() => setEditorHeightMode('max')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  editorHeightMode === 'max'
                    ? 'bg-muted text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Max
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

      {/* Input Section (Hidden in Fullscreen if Diff is actively shown) */}
      <div className={`grid gap-4 md:grid-cols-2 ${isFullscreen && showDiff ? 'hidden' : ''}`}>
        {/* Left JSON Editor */}
        <Card className="p-0 overflow-hidden border">
          <div className="bg-muted/50 border-b p-3 flex items-center justify-between">
            <div>
              <Label className="text-sm font-semibold">Original JSON</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Source JSON for comparison</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => copyToClipboard(leftJson, 'left')}
            >
              {copiedSide === 'left' ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              {copiedSide === 'left' ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <Editor
            height={getInputEditorHeight()}
            defaultLanguage="json"
            value={leftJson}
            onChange={(value) => setLeftJson(value || '')}
            onValidate={handleLeftValidate}
            theme={editorTheme}
            options={{
              minimap: { enabled: false },
              wordWrap: 'on',
              formatOnPaste: true,
              formatOnType: true,
              scrollBeyondLastLine: false,
              fontSize: 13,
              lineNumbers: 'on',
              automaticLayout: true,
              folding: true,
              foldingStrategy: 'indentation',
              foldingHighlight: true,
              unfoldOnClickAfterEndOfLine: true,
            }}
          />
          {parseErrors.find((e) => e.side === 'left') && (
            <div className="flex items-start gap-2 p-2.5 border-t bg-destructive/10 text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="text-xs font-mono">{parseErrors.find((e) => e.side === 'left')?.message}</p>
            </div>
          )}
        </Card>

        {/* Right JSON Editor */}
        <Card className="p-0 overflow-hidden border">
          <div className="bg-muted/50 border-b p-3 flex items-center justify-between">
            <div>
              <Label className="text-sm font-semibold">Modified JSON</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Target JSON to compare against</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => copyToClipboard(rightJson, 'right')}
            >
              {copiedSide === 'right' ? (
                <Check className="h-3 w-3 text-green-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              {copiedSide === 'right' ? 'Copied' : 'Copy'}
            </Button>
          </div>
          <Editor
            height={getInputEditorHeight()}
            defaultLanguage="json"
            value={rightJson}
            onChange={(value) => setRightJson(value || '')}
            onValidate={handleRightValidate}
            theme={editorTheme}
            options={{
              minimap: { enabled: false },
              wordWrap: 'on',
              formatOnPaste: true,
              formatOnType: true,
              scrollBeyondLastLine: false,
              fontSize: 13,
              lineNumbers: 'on',
              automaticLayout: true,
              folding: true,
              foldingStrategy: 'indentation',
              foldingHighlight: true,
              unfoldOnClickAfterEndOfLine: true,
            }}
          />
          {parseErrors.find((e) => e.side === 'right') && (
            <div className="flex items-start gap-2 p-2.5 border-t bg-destructive/10 text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="text-xs font-mono">{parseErrors.find((e) => e.side === 'right')?.message}</p>
            </div>
          )}
        </Card>
      </div>

      {/* Diff Results */}
      {showDiff && (
        <div className={`space-y-4 ${isFullscreen ? 'flex-1 flex flex-col min-h-0' : ''}`}>
          {/* Comparison Summary Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3 rounded-lg border">
            <div className="flex items-center gap-2">
              <GitCompare className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Monaco Visual JSON Diff</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
              <span className="px-2.5 py-1 rounded-md bg-green-500/10 text-green-700 dark:text-green-300 font-mono">
                +{stats.additions} added
              </span>
              <span className="px-2.5 py-1 rounded-md bg-red-500/10 text-red-700 dark:text-red-300 font-mono">
                -{stats.deletions} removed
              </span>
              <span className="px-2.5 py-1 rounded-md bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 font-mono">
                {stats.modifications} modified
              </span>
              <span className="px-2.5 py-1 rounded-md bg-muted text-muted-foreground font-mono">
                {stats.unchanged} unchanged
              </span>
            </div>
          </div>

          {/* Monaco Diff Editor */}
          <Card
            className={`p-0 overflow-hidden border shadow-md ${
              isFullscreen ? 'flex-1 flex flex-col min-h-0' : ''
            }`}
          >
            <DiffEditor
              height={getDiffEditorHeight()}
              language="json"
              original={formattedLeftJson}
              modified={formattedRightJson}
              theme={editorTheme}
              options={{
                renderSideBySide: isSideBySide,
                originalEditable: false,
                readOnly: false,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 13,
                lineNumbers: 'on',
                automaticLayout: true,
                wordWrap: 'on',
                folding: true,
                foldingStrategy: 'indentation',
                foldingHighlight: true,
                unfoldOnClickAfterEndOfLine: true,
              }}
            />
          </Card>
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
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
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
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />
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
          <span>100% Client-Side: Your JSON data never leaves your device.</span>
        </div>
      </div>
    </div>
  );
}
