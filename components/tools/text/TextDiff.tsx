'use client';

import { useState } from 'react';
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
}

interface DiffRow {
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

export function TextDiff({ title, description, features, useCases, faq }: TextDiffProps) {
    const [leftText, setLeftText] = useState('');
    const [rightText, setRightText] = useState('');
    const [rows, setRows] = useState<DiffRow[]>([]);
    const [stats, setStats] = useState({ additions: 0, deletions: 0, unchanged: 0 });
    const [showDiff, setShowDiff] = useState(false);

    const computeDiff = () => {
        // Use diff package's diffLines
        const changes = Diff.diffLines(leftText, rightText);

        const newRows: DiffRow[] = [];
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
                // If it's added, verify if previous was removed to treat as modification
                // But for standard side-by-side, we usually show removal then addition
                // To make it look "aligned" like GitHub, if we have a Removed block followed by Added block,
                // we can try to pair them up to show them side-by-side as "modified".
                // HOWEVER, standard behavior: Added means only on right.

                // Let's look ahead/behind. If we are processing an 'added' and the previous one was 'removed',
                // we might have already handled it in the 'removed' block if we look ahead there.
                // Simpler approach: Process 'removed' block. Check if next is 'added'.
                // If so, align them.

                // Since we are iterating, let's handle this in the 'removed' case check.
                // If we are here, it means this 'added' block was NOT preceded by 'removed' (or we skipped it).

                // Actually, let's handle filtering in the loop structure.

                // If we see 'added' here, it's a pure addition (Green right, Empty left)
                lines.forEach(line => {
                    newRows.push({
                        right: { num: rightLineNum++, value: line, type: 'added' }
                    });
                    additions++;
                });
                i++;
            } else if (change.removed) {
                // It is removed. Check if next is added.
                const nextChange = changes[i + 1];

                if (nextChange && nextChange.added) {
                    // We have a modification block (Removed -> Added)
                    // We will pair lines.
                    const removedLines = lines;
                    const addedLines = nextChange.value.replace(/\n$/, '').split('\n');

                    const commonLength = Math.min(removedLines.length, addedLines.length);

                    // 1. Paired lines (Modified)
                    for (let k = 0; k < commonLength; k++) {
                        newRows.push({
                            left: { num: leftLineNum++, value: removedLines[k], type: 'modified' },
                            right: { num: rightLineNum++, value: addedLines[k], type: 'modified' }
                        });
                        // Count as both? Or modification? Let's count as del+add for stats usually, 
                        // but here visual stats might want 'modifications'.
                        // Let's stick to simple stats: additions/deletions counts line count.
                        deletions++;
                        additions++;
                    }

                    // 2. Extra removed lines (if any)
                    for (let k = commonLength; k < removedLines.length; k++) {
                        newRows.push({
                            left: { num: leftLineNum++, value: removedLines[k], type: 'removed' }
                        });
                        deletions++;
                    }

                    // 3. Extra added lines (if any)
                    for (let k = commonLength; k < addedLines.length; k++) {
                        newRows.push({
                            right: { num: rightLineNum++, value: addedLines[k], type: 'added' }
                        });
                        additions++;
                    }

                    // Skip next change since we processed it
                    i += 2;
                } else {
                    // Pure removal (Red left, Empty right)
                    lines.forEach(line => {
                        newRows.push({
                            left: { num: leftLineNum++, value: line, type: 'removed' }
                        });
                        deletions++;
                    });
                    i++;
                }
            } else {
                // Unchanged (White/Grey both)
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

        setRows(newRows);
        setStats({ additions, deletions, unchanged });
        setShowDiff(true);
    };

    const reset = () => {
        setLeftText('');
        setRightText('');
        setRows([]);
        setShowDiff(false);
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
                    {/* Left Text */}
                    <Card className="p-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>Original Text</Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 gap-1"
                                    onClick={() => copyToClipboard(leftText)}
                                >
                                    <Copy className="h-3 w-3" />
                                    Copy
                                </Button>
                            </div>
                            <Textarea
                                placeholder="Paste or type your original text here..."
                                className="min-h-[300px] font-mono text-sm resize-y whitespace-pre"
                                value={leftText}
                                onChange={(e) => setLeftText(e.target.value)}
                            />
                        </div>
                    </Card>

                    {/* Right Text */}
                    <Card className="p-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>Modified Text</Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 gap-1"
                                    onClick={() => copyToClipboard(rightText)}
                                >
                                    <Copy className="h-3 w-3" />
                                    Copy
                                </Button>
                            </div>
                            <Textarea
                                placeholder="Paste or type your modified text here..."
                                className="min-h-[300px] font-mono text-sm resize-y whitespace-pre"
                                value={rightText}
                                onChange={(e) => setRightText(e.target.value)}
                            />
                        </div>
                    </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 justify-center">
                    <Button
                        onClick={computeDiff}
                        disabled={!leftText && !rightText}
                        className="gap-2 bg-purple-600 hover:bg-purple-700"
                    >
                        <GitCompare className="h-4 w-4" />
                        Compare Texts
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
                                    <p className="text-xs text-muted-foreground">Additions</p>
                                </div>
                                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-center">
                                    <p className="text-2xl font-bold text-red-600">-{stats.deletions}</p>
                                    <p className="text-xs text-muted-foreground">Deletions</p>
                                </div>
                                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/20 text-center">
                                    <p className="text-2xl font-bold text-gray-600">{stats.unchanged}</p>
                                    <p className="text-xs text-muted-foreground">Unchanged Lines</p>
                                </div>
                            </div>
                        </Card>

                        {/* Diff View */}
                        <Card className="p-0 overflow-hidden border shadow-sm">
                            <div className="bg-muted/50 border-b p-2 font-medium text-sm flex">
                                <span className="flex-1 text-center">Original</span>
                                <span className="w-px bg-border mx-2"></span>
                                <span className="flex-1 text-center">Modified</span>
                            </div>

                            <div className="font-mono text-xs overflow-x-auto">
                                <div className="min-w-[800px]">
                                    {rows.map((row, idx) => (
                                        <div key={idx} className="flex border-b last:border-0 hover:bg-muted/30 group">
                                            {/* LEFT SIDE */}
                                            <div className={`flex-1 flex min-w-0 ${row.left?.type === 'removed' ? 'bg-[#ffebe9] dark:bg-[#3e1f1f]' :
                                                    row.left?.type === 'modified' ? 'bg-[#fff5b1] dark:bg-[#423818]' : ''
                                                }`}>
                                                <div className="w-10 px-2 py-1 text-right text-muted-foreground select-none border-r bg-muted/20 text-[10px] leading-5">
                                                    {row.left?.num || ''}
                                                </div>
                                                <div className="flex-1 px-2 py-1 whitespace-pre-wrap break-all leading-5">
                                                    {row.left?.type === 'removed' && <span className="select-none text-red-500 mr-2 font-bold">-</span>}
                                                    <span className={row.left?.type === 'removed' ? 'text-red-900 dark:text-red-300' : ''}>
                                                        {row.left?.value}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* CENTER DIVIDER */}
                                            <div className="w-px bg-border"></div>

                                            {/* RIGHT SIDE */}
                                            <div className={`flex-1 flex min-w-0 ${row.right?.type === 'added' ? 'bg-[#e6ffec] dark:bg-[#1a3d24]' :
                                                    row.right?.type === 'modified' ? 'bg-[#fff5b1] dark:bg-[#423818]' : ''
                                                }`}>
                                                <div className="w-10 px-2 py-1 text-right text-muted-foreground select-none border-r bg-muted/20 text-[10px] leading-5">
                                                    {row.right?.num || ''}
                                                </div>
                                                <div className="flex-1 px-2 py-1 whitespace-pre-wrap break-all leading-5">
                                                    {row.right?.type === 'added' && <span className="select-none text-green-500 mr-2 font-bold">+</span>}
                                                    <span className={row.right?.type === 'added' ? 'text-green-900 dark:text-green-300' : ''}>
                                                        {row.right?.value}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
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
                                This tool processes text entirely in your browser.
                                Your data never leaves your device and is never uploaded to any server.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
