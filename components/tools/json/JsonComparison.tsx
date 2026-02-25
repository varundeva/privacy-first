'use client';

import { useState, useCallback } from 'react';
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

    const addToResult = (key: string, value: any) => {
        if (value === null) {
            result[key] = 'null';
        } else if (typeof value === 'object' && !Array.isArray(value)) {
            const flattened = flattenJson(value, key ? `${key}.` : '');
            Object.assign(result, flattened);
        } else if (Array.isArray(value)) {
            result[key] = `[${value.length} items]`;
        } else if (typeof value === 'string') {
            result[key] = `"${value}"`;
        } else {
            result[key] = String(value);
        }
    };

    if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
        const rootKey = prefix.slice(0, -1) || 'root';
        return { [rootKey]: JSON.stringify(obj) };
    }

    for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix + key;
        addToResult(fullKey, value);
    }

    return result;
}

function computeJsonDiff(leftJson: string, rightJson: string): { rows: DiffRow[]; stats: ComparisonStats } {
    const leftParsed = tryParseJson(leftJson);
    const rightParsed = tryParseJson(rightJson);

    const newRows: DiffRow[] = [];
    const stats: ComparisonStats = {
        additions: 0,
        deletions: 0,
        modifications: 0,
        unchanged: 0,
        keysOnlyLeft: 0,
        keysOnlyRight: 0,
    };

    if (!leftParsed.success || !rightParsed.success) {
        return { rows: newRows, stats };
    }

    const leftFlat = flattenJson(leftParsed.data);
    const rightFlat = flattenJson(rightParsed.data);

    const allKeys = new Set([...Object.keys(leftFlat), ...Object.keys(rightFlat)]);
    const sortedKeys = Array.from(allKeys).sort();

    for (const key of sortedKeys) {
        const leftValue = leftFlat[key];
        const rightValue = rightFlat[key];

        if (leftValue === undefined) {
            // Only in right
            newRows.push({
                right: { key, value: rightValue, type: 'added' },
            });
            stats.additions++;
            stats.keysOnlyRight++;
        } else if (rightValue === undefined) {
            // Only in left
            newRows.push({
                left: { key, value: leftValue, type: 'removed' },
            });
            stats.deletions++;
            stats.keysOnlyLeft++;
        } else if (leftValue === rightValue) {
            // Same value
            newRows.push({
                left: { key, value: leftValue, type: 'same' },
                right: { key, value: rightValue, type: 'same' },
            });
            stats.unchanged++;
        } else {
            // Modified
            newRows.push({
                left: { key, value: leftValue, type: 'modified' },
                right: { key, value: rightValue, type: 'modified' },
            });
            stats.modifications++;
        }
    }

    return { rows: newRows, stats };
}

function computeLineDiff(leftJson: string, rightJson: string): { rows: LineDiffRow[]; stats: ComparisonStats } {
    const changes = Diff.diffLines(leftJson, rightJson);

    const newRows: LineDiffRow[] = [];
    let leftLineNum = 1;
    let rightLineNum = 1;
    let additions = 0;
    let deletions = 0;
    let unchanged = 0;
    let modifications = 0;

    let i = 0;
    while (i < changes.length) {
        const change = changes[i];
        const lines = change.value.replace(/\n$/, '').split('\n');

        if (change.added) {
            lines.forEach(line => {
                newRows.push({
                    right: { num: rightLineNum++, value: line, type: 'added' }
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
                        right: { num: rightLineNum++, value: addedLines[k], type: 'modified' }
                    });
                    deletions++;
                    additions++;
                    modifications++;
                }

                for (let k = commonLength; k < removedLines.length; k++) {
                    newRows.push({
                        left: { num: leftLineNum++, value: removedLines[k], type: 'removed' }
                    });
                    deletions++;
                }

                for (let k = commonLength; k < addedLines.length; k++) {
                    newRows.push({
                        right: { num: rightLineNum++, value: addedLines[k], type: 'added' }
                    });
                    additions++;
                }

                i += 2;
            } else {
                lines.forEach(line => {
                    newRows.push({
                        left: { num: leftLineNum++, value: line, type: 'removed' }
                    });
                    deletions++;
                });
                i++;
            }
        } else {
            lines.forEach(line => {
                newRows.push({
                    left: { num: leftLineNum++, value: line, type: 'same' },
                    right: { num: rightLineNum++, value: line, type: 'same' }
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
        }
    };
}

export function JsonComparison({ title, description, features, useCases, faq }: JsonComparisonProps) {
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
    const [diffView, setDiffView] = useState<'line' | 'key'>('line');
    const [parseErrors, setParseErrors] = useState<ParseError[]>([]);
    const { theme } = useTheme();
    const editorTheme = theme === 'dark' ? 'vs-dark' : 'light';

    const handleLeftValidate: OnValidate = useCallback((markers) => {
        const errors = markers.filter(m => m.severity === 8);
        if (errors.length > 0) {
            setParseErrors(prev => [
                ...prev.filter(e => e.side !== 'left'),
                { side: 'left', message: errors[0].message + ` (Line ${errors[0].startLineNumber})` }
            ]);
        } else {
            setParseErrors(prev => prev.filter(e => e.side !== 'left'));
        }
    }, []);

    const handleRightValidate: OnValidate = useCallback((markers) => {
        const errors = markers.filter(m => m.severity === 8);
        if (errors.length > 0) {
            setParseErrors(prev => [
                ...prev.filter(e => e.side !== 'right'),
                { side: 'right', message: errors[0].message + ` (Line ${errors[0].startLineNumber})` }
            ]);
        } else {
            setParseErrors(prev => prev.filter(e => e.side !== 'right'));
        }
    }, []);

    const validateAndCompare = () => {
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
            const { rows: lineDiffRows, stats: lineDiffStats } = computeLineDiff(formatted_left, formatted_right);
            setLineRows(lineDiffRows);
            
            // Compute key-by-key diff
            const { rows: keyDiffRows, stats: keyDiffStats } = computeJsonDiff(leftJson, rightJson);
            setRows(keyDiffRows);
            
            // Use line diff stats for display
            setStats(lineDiffStats);
            setShowDiff(true);
        }
    };

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

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Tool Header */}
            <ToolHeader title={title} description={description} />

            {/* Main Content */}
            <main className="flex-1 mx-auto max-w-7xl px-4 py-8 sm:px-6 w-full space-y-8">
                {/* Input Section */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Left JSON Editor */}
                    <Card className="p-0 overflow-hidden border-2">
                        <div className="bg-muted/50 border-b p-3 flex items-center justify-between">
                            <div>
                                <Label className="text-sm font-semibold">Original JSON</Label>
                                <p className="text-xs text-muted-foreground mt-0.5">Paste or edit your original JSON</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 gap-1"
                                onClick={() => copyToClipboard(leftJson)}
                            >
                                <Copy className="h-3 w-3" />
                                Copy
                            </Button>
                        </div>
                        <Editor
                            height="400px"
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
                        {parseErrors.find(e => e.side === 'left') && (
                            <div className="flex items-start gap-2 p-2 border-t bg-red-50 dark:bg-red-900/20">
                                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                                <p className="text-xs text-red-600 dark:text-red-400">
                                    {parseErrors.find(e => e.side === 'left')?.message}
                                </p>
                            </div>
                        )}
                    </Card>

                    {/* Right JSON Editor */}
                    <Card className="p-0 overflow-hidden border-2">
                        <div className="bg-muted/50 border-b p-3 flex items-center justify-between">
                            <div>
                                <Label className="text-sm font-semibold">Modified JSON</Label>
                                <p className="text-xs text-muted-foreground mt-0.5">Paste or edit your modified JSON</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 gap-1"
                                onClick={() => copyToClipboard(rightJson)}
                            >
                                <Copy className="h-3 w-3" />
                                Copy
                            </Button>
                        </div>
                        <Editor
                            height="400px"
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
                        {parseErrors.find(e => e.side === 'right') && (
                            <div className="flex items-start gap-2 p-2 border-t bg-red-50 dark:bg-red-900/20">
                                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                                <p className="text-xs text-red-600 dark:text-red-400">
                                    {parseErrors.find(e => e.side === 'right')?.message}
                                </p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-center">
                    <Button
                        onClick={validateAndCompare}
                        disabled={!leftJson.trim() && !rightJson.trim()}
                        className="gap-2 bg-purple-600 hover:bg-purple-700"
                    >
                        <GitCompare className="h-4 w-4" />
                        Compare JSON
                    </Button>
                    {showDiff && (
                        <Button variant="outline" className="gap-2" onClick={reset}>
                            <RotateCcw className="h-4 w-4" />
                            Reset
                        </Button>
                    )}
                </div>

                {/* Diff Results */}
                {showDiff && (
                    <div className="space-y-4">
                        {/* Stats */}
                        <Card className="p-4">
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <GitCompare className="h-4 w-4" />
                                Comparison Summary
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-center">
                                    <p className="text-2xl font-bold text-green-600">+{stats.additions}</p>
                                    <p className="text-xs text-muted-foreground">New Keys</p>
                                </div>
                                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-center">
                                    <p className="text-2xl font-bold text-red-600">-{stats.deletions}</p>
                                    <p className="text-xs text-muted-foreground">Removed Keys</p>
                                </div>
                                <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-center">
                                    <p className="text-2xl font-bold text-yellow-600">{stats.modifications}</p>
                                    <p className="text-xs text-muted-foreground">Modified</p>
                                </div>
                                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/20 text-center">
                                    <p className="text-2xl font-bold text-gray-600">{stats.unchanged}</p>
                                    <p className="text-xs text-muted-foreground">Unchanged</p>
                                </div>
                                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
                                    <p className="text-2xl font-bold text-blue-600">{stats.keysOnlyLeft}</p>
                                    <p className="text-xs text-muted-foreground">Left Only</p>
                                </div>
                                <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-center">
                                    <p className="text-2xl font-bold text-purple-600">{stats.keysOnlyRight}</p>
                                    <p className="text-xs text-muted-foreground">Right Only</p>
                                </div>
                            </div>
                        </Card>

                        {/* Monaco Diff Editor */}
                        <Card className="p-0 overflow-hidden border shadow-md">
                            <DiffEditor
                                height="600px"
                                language="json"
                                original={formattedLeftJson}
                                modified={formattedRightJson}
                                theme={editorTheme}
                                options={{
                                    renderSideBySide: true,
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

                {/* Features & FAQ Section */}
                {((features && features.length > 0) || (useCases && useCases.length > 0) || (faq && faq.length > 0)) && (
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
                                            <AccordionTrigger className="text-left font-medium">{item.question}</AccordionTrigger>
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

            {/* Privacy Footer */}
            <footer className="border-t mt-auto py-8 bg-muted/10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="flex flex-col items-center justify-center gap-4 text-center">
                        <span className="text-2xl">🔒</span>
                        <div>
                            <h3 className="font-medium text-foreground">100% Privacy Guarantee</h3>
                            <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
                                This tool processes JSON entirely in your browser.
                                Your data never leaves your device and is never uploaded to any server.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
