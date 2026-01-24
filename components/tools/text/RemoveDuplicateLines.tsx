'use client';

import { useState, useMemo } from 'react';
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

    const result = useMemo(() => {
        if (!inputText) return { text: '', stats: { original: 0, unique: 0, removed: 0 } };

        const lines = inputText.split('\n');
        const uniqueLines = new Set<string>();
        const resultLines: string[] = [];

        lines.forEach(line => {
            // Process line for comparison key
            let key = line;
            if (trimWhitespace) key = key.trim();
            if (!caseSensitive) key = key.toLowerCase();

            // We keep the original line presentation of the FIRST occurrence
            // So if we haven't seen this key, we add the original line (maybe trimmed if option on?)
            // Usually, "Remove Duplicates" implies preserving the first instance's formatting
            // But if "Trim Whitespace" is on, users usually expect the output to be trimmed too?
            // Let's assume: comparison uses processed key. Output uses:
            // - If trimWhitespace is true: The trimmed version of the line
            // - Else: The original version of the line

            // To be consistent:
            // If trim is ON, we store the trimmed version.
            // If trim is OFF, we store original.

            const contentToAdd = trimWhitespace ? line.trim() : line;

            // Re-calculate key based on what we are effectively comparing
            // If we are trimming, the key is already trimmed.
            // If not trimming, key includes spaces.
            // Case sensitivity affects KEY only, not content.

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

            <main className="flex-1 mx-auto max-w-5xl px-4 py-8 sm:px-6 w-full space-y-8">
                {/* Stats & Options */}
                <Card className="p-6">
                    <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                        <div className="flex gap-4 text-sm">
                            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center min-w-[100px]">
                                <p className="font-bold text-blue-600 text-lg">{result.stats.original}</p>
                                <p className="text-muted-foreground">Total Lines</p>
                            </div>
                            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-center min-w-[100px]">
                                <p className="font-bold text-green-600 text-lg">{result.stats.unique}</p>
                                <p className="text-muted-foreground">Unique</p>
                            </div>
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-center min-w-[100px]">
                                <p className="font-bold text-red-600 text-lg">{result.stats.removed}</p>
                                <p className="text-muted-foreground">Removed</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="case-sensitive"
                                    checked={caseSensitive}
                                    onCheckedChange={setCaseSensitive}
                                />
                                <Label htmlFor="case-sensitive">Case Sensitive Comparison</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="trim-whitespace"
                                    checked={trimWhitespace}
                                    onCheckedChange={setTrimWhitespace}
                                />
                                <Label htmlFor="trim-whitespace">Trim Whitespace</Label>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Input/Output */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Input */}
                    <Card className="p-4 flex flex-col h-[500px]">
                        <div className="flex justify-between items-center mb-4">
                            <Label>Source Text</Label>
                            <Button variant="ghost" size="sm" onClick={() => setInputText('')} disabled={!inputText}>
                                <Trash2 className="h-3 w-3 mr-2" />
                                Clear
                            </Button>
                        </div>
                        <Textarea
                            placeholder="Paste text with duplicate lines here..."
                            className="flex-1 font-mono text-sm resize-none whitespace-pre"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                        />
                    </Card>

                    {/* Output */}
                    <Card className="p-4 flex flex-col h-[500px] border-primary/20 bg-primary/5">
                        <div className="flex justify-between items-center mb-4">
                            <Label>Unique Lines</Label>
                            <Button
                                variant="default"
                                size="sm"
                                className="gap-2 bg-purple-600 hover:bg-purple-700"
                                onClick={handleCopy}
                                disabled={!result.text}
                            >
                                <Copy className="h-3 w-3" />
                                Copy Result
                            </Button>
                        </div>
                        <Textarea
                            readOnly
                            placeholder="Result will appear here..."
                            className="flex-1 font-mono text-sm resize-none bg-background/50 whitespace-pre"
                            value={result.text}
                        />
                    </Card>
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

            <footer className="border-t mt-auto py-8 bg-muted/10">
                <div className="mx-auto max-w-5xl px-4 sm:px-6">
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
