'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ToolHeader } from '../ToolHeader';
import {
    Copy,
    RotateCcw,
    Layers,
    Check,
    Lightbulb,
    HelpCircle,
    ArrowRight,
    Trash2,
    Maximize2,
    Minimize2,
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

interface RemoveDuplicateLinesProps {
    title: string;
    description: string;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
}

export function RemoveDuplicateLines({ title, description, features, useCases, faq }: RemoveDuplicateLinesProps) {
    const [inputText, setInputText] = useState('');
    const [caseSensitive, setCaseSensitive] = useState(false);
    const [trimWhitespace, setTrimWhitespace] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

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

    const result = useMemo(() => {
        if (!inputText) return { text: '', stats: { original: 0, unique: 0, removed: 0 } };

        const lines = inputText.split('\n');
        const uniqueLines = new Set<string>();
        const resultLines: string[] = [];

        lines.forEach(line => {
            let key = line;
            if (trimWhitespace) key = key.trim();
            if (!caseSensitive) key = key.toLowerCase();

            const contentToAdd = trimWhitespace ? line.trim() : line;

            if (!uniqueLines.has(key)) {
                uniqueLines.add(key);
                resultLines.push(contentToAdd);
            }
        });

        return {
            text: resultLines.join('\n'),
            stats: {
                original: lines.length,
                unique: resultLines.length,
                removed: lines.length - resultLines.length
            }
        };
    }, [inputText, caseSensitive, trimWhitespace]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(result.text);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const handleReset = () => {
        setInputText('');
        setCaseSensitive(false);
        setTrimWhitespace(true);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <ToolHeader title={title} description={description} />

            <main className="flex-1 mx-auto px-4 py-8 sm:px-6 w-full max-w-[96%] xl:max-w-[94%] 2xl:max-w-[1700px] space-y-8">
                {/* Workspace Container */}
                <div className={isFullscreen ? 'fixed inset-0 z-50 bg-background flex flex-col p-4 sm:p-6 overflow-hidden space-y-4' : 'space-y-6'}>
                    {/* Stats & Options */}
                    <Card className="p-4 sm:p-6 shadow-sm">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                            <div className="flex flex-wrap gap-3 text-sm">
                                <div className="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center min-w-[90px]">
                                    <p className="font-bold text-blue-600 text-lg leading-tight">{result.stats.original}</p>
                                    <p className="text-[11px] text-muted-foreground uppercase font-medium">Total Lines</p>
                                </div>
                                <div className="px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-center min-w-[90px]">
                                    <p className="font-bold text-green-600 text-lg leading-tight">{result.stats.unique}</p>
                                    <p className="text-[11px] text-muted-foreground uppercase font-medium">Unique</p>
                                </div>
                                <div className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-center min-w-[90px]">
                                    <p className="font-bold text-red-600 text-lg leading-tight">{result.stats.removed}</p>
                                    <p className="text-[11px] text-muted-foreground uppercase font-medium">Removed</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="case-sensitive"
                                        checked={caseSensitive}
                                        onCheckedChange={setCaseSensitive}
                                    />
                                    <Label htmlFor="case-sensitive" className="text-xs font-medium cursor-pointer">Case Sensitive</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="trim-whitespace"
                                        checked={trimWhitespace}
                                        onCheckedChange={setTrimWhitespace}
                                    />
                                    <Label htmlFor="trim-whitespace" className="text-xs font-medium cursor-pointer">Trim Whitespace</Label>
                                </div>

                                <Button
                                    variant={isFullscreen ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setIsFullscreen(!isFullscreen)}
                                    className="gap-1.5 h-8 text-xs font-medium ml-auto"
                                    title={isFullscreen ? "Exit Fullscreen (Esc)" : "Expand Fullscreen"}
                                >
                                    {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                                    <span className="hidden sm:inline">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
                                    {isFullscreen && <kbd className="hidden sm:inline-block px-1 py-0.2 bg-primary-foreground/20 rounded text-[10px] ml-1">ESC</kbd>}
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Input/Output Dual Panes */}
                    <div className={`grid gap-4 sm:gap-6 md:grid-cols-2 ${isFullscreen ? 'flex-1 min-h-0' : ''}`}>
                        {/* Input */}
                        <Card className={`p-4 flex flex-col ${isFullscreen ? 'h-full min-h-0' : 'h-[500px]'}`}>
                            <div className="flex justify-between items-center mb-3">
                                <Label className="text-xs font-semibold">Source Text ({result.stats.original} lines)</Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs text-muted-foreground hover:text-destructive"
                                    onClick={() => setInputText('')}
                                    disabled={!inputText}
                                >
                                    <Trash2 className="h-3 w-3 mr-1.5" />
                                    Clear
                                </Button>
                            </div>
                            <Textarea
                                placeholder="Paste text with duplicate lines here (emails, IDs, logs)..."
                                className="flex-1 font-mono text-sm resize-none whitespace-pre focus:outline-none"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                            />
                        </Card>

                        {/* Output */}
                        <Card className={`p-4 flex flex-col border-primary/20 bg-primary/5 ${isFullscreen ? 'h-full min-h-0' : 'h-[500px]'}`}>
                            <div className="flex justify-between items-center mb-3">
                                <Label className="text-xs font-semibold">Unique Output ({result.stats.unique} lines)</Label>
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="gap-1.5 h-7 text-xs bg-purple-600 hover:bg-purple-700"
                                    onClick={handleCopy}
                                    disabled={!result.text}
                                >
                                    <Copy className="h-3 w-3" />
                                    Copy Result
                                </Button>
                            </div>
                            <Textarea
                                readOnly
                                placeholder="Deduplicated result will appear here..."
                                className="flex-1 font-mono text-sm resize-none bg-background/50 whitespace-pre focus:outline-none"
                                value={result.text}
                            />
                        </Card>
                    </div>
                </div>

                {/* Features & FAQ Section */}
                {((features && features.length > 0) || (useCases && useCases.length > 0) || (faq && faq.length > 0)) && (
                    <div className="grid gap-8 pt-8 border-t">
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

                        {/* FAQ */}
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

            {/* Privacy Guarantee Banner */}
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 w-full text-center border-t border-dashed mt-8">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-muted/50 text-sm text-muted-foreground">
                    <span>🔒</span>
                    <span>100% Client-Side: Your data never leaves your device.</span>
                </div>
            </div>
        </div>
    );
}
