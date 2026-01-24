'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ToolHeader } from '../ToolHeader';
import {
    Copy,
    RotateCcw,
    Search,
    Replace,
    Check,
    Lightbulb,
    HelpCircle,
    ArrowRight,
    Settings,
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

interface FindAndReplaceProps {
    title: string;
    description: string;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
}

export function FindAndReplace({ title, description, features, useCases, faq }: FindAndReplaceProps) {
    const [inputText, setInputText] = useState('');
    const [findText, setFindText] = useState('');
    const [replaceText, setReplaceText] = useState('');
    const [matchCase, setMatchCase] = useState(false);
    const [useRegex, setUseRegex] = useState(false);
    const [wholeWord, setWholeWord] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Calculate replacements and result
    const result = useMemo(() => {
        setError(null);
        if (!inputText || !findText) {
            return { text: inputText, count: 0 };
        }

        try {
            let pattern: RegExp;
            let flags = 'g'; // Always global replace for this tool
            if (!matchCase) flags += 'i';

            if (useRegex) {
                // User provided regex
                pattern = new RegExp(findText, flags);
            } else {
                // Literal string match
                // Escape special regex chars
                let escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

                if (wholeWord) {
                    escaped = `\\b${escaped}\\b`;
                }

                pattern = new RegExp(escaped, flags);
            }

            // Count matches
            const matches = inputText.match(pattern);
            const count = matches ? matches.length : 0;

            // Perform replacement
            const newText = inputText.replace(pattern, replaceText);

            return { text: newText, count };

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Invalid search pattern');
            return { text: inputText, count: 0 };
        }
    }, [inputText, findText, replaceText, matchCase, useRegex, wholeWord]);

    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const handleReset = () => {
        setInputText('');
        setFindText('');
        setReplaceText('');
        setMatchCase(false);
        setUseRegex(false);
        setWholeWord(false);
        setError(null);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <ToolHeader title={title} description={description} />

            <main className="flex-1 mx-auto max-w-5xl px-4 py-8 sm:px-6 w-full space-y-8">
                {/* Search & Replace Controls */}
                <Card className="p-6 space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Find Input */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Search className="h-4 w-4" />
                                Find
                            </Label>
                            <Input
                                placeholder={useRegex ? "Enter regex pattern..." : "Enter text to find..."}
                                value={findText}
                                onChange={(e) => setFindText(e.target.value)}
                                className={error ? "border-destructive" : ""}
                            />
                            {error && <p className="text-xs text-destructive">{error}</p>}
                        </div>

                        {/* Replace Input */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Replace className="h-4 w-4" />
                                Replace with
                            </Label>
                            <Input
                                placeholder="Enter replacement text..."
                                value={replaceText}
                                onChange={(e) => setReplaceText(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Options */}
                    <div className="flex flex-wrap gap-6 p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="match-case"
                                checked={matchCase}
                                onCheckedChange={setMatchCase}
                            />
                            <Label htmlFor="match-case">Match Case</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="use-regex"
                                checked={useRegex}
                                onCheckedChange={(checked) => {
                                    setUseRegex(checked);
                                    if (checked) setWholeWord(false); // Disable whole word in regex mode
                                }}
                            />
                            <Label htmlFor="use-regex">Regular Expression</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="whole-word"
                                checked={wholeWord}
                                onCheckedChange={setWholeWord}
                                disabled={useRegex}
                            />
                            <Label htmlFor="whole-word" className={useRegex ? "text-muted-foreground" : ""}>
                                Whole Word Only
                            </Label>
                        </div>
                    </div>
                </Card>

                {/* Text Areas */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Input */}
                    <Card className="p-4 flex flex-col h-[500px]">
                        <div className="flex justify-between items-center mb-4">
                            <Label>Source Text</Label>
                            <Button variant="ghost" size="sm" onClick={() => setInputText('')} disabled={!inputText}>
                                Clear
                            </Button>
                        </div>
                        <Textarea
                            placeholder="Paste your source text here..."
                            className="flex-1 font-mono text-sm resize-none"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                        />
                    </Card>

                    {/* Output */}
                    <Card className="p-4 flex flex-col h-[500px] border-primary/20 bg-primary/5">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-3">
                                <Label>Result</Label>
                                {result.count > 0 && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium">
                                        {result.count} replacements
                                    </span>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => handleCopy(result.text)}
                                disabled={!result.text || result.text === inputText}
                            >
                                <Copy className="h-3 w-3" />
                                Copy Result
                            </Button>
                        </div>
                        <Textarea
                            readOnly
                            placeholder="Result will appear here..."
                            className="flex-1 font-mono text-sm resize-none bg-background/50"
                            value={result.text}
                        />
                    </Card>
                </div>

                {/* Reset Action */}
                <div className="flex justify-center">
                    <Button variant="ghost" onClick={handleReset} className="gap-2 text-muted-foreground">
                        <RotateCcw className="h-4 w-4" />
                        Reset All
                    </Button>
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
