'use client';

import { useState, useMemo, useEffect } from 'react';
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
    Maximize2,
    Minimize2,
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

            <main className="flex-1 mx-auto px-4 py-8 sm:px-6 w-full max-w-[96%] xl:max-w-[94%] 2xl:max-w-[1700px] space-y-8">
                {/* Workspace Container */}
                <div className={isFullscreen ? 'fixed inset-0 z-50 bg-background flex flex-col p-4 sm:p-6 overflow-hidden space-y-4' : 'space-y-6'}>
                    {/* Search & Replace Controls */}
                    <Card className="p-4 sm:p-6 space-y-4 shadow-sm">
                        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                            {/* Find Input */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-xs font-semibold">
                                    <Search className="h-4 w-4 text-primary" />
                                    Find
                                </Label>
                                <Input
                                    placeholder={useRegex ? "Enter regex pattern..." : "Enter text to find..."}
                                    value={findText}
                                    onChange={(e) => setFindText(e.target.value)}
                                    className={error ? "border-destructive h-9 text-xs" : "h-9 text-xs"}
                                />
                                {error && <p className="text-xs text-destructive">{error}</p>}
                            </div>

                            {/* Replace Input */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2 text-xs font-semibold">
                                    <Replace className="h-4 w-4 text-emerald-500" />
                                    Replace with
                                </Label>
                                <Input
                                    placeholder="Enter replacement text..."
                                    value={replaceText}
                                    onChange={(e) => setReplaceText(e.target.value)}
                                    className="h-9 text-xs"
                                />
                            </div>
                        </div>

                        {/* Options */}
                        <div className="flex flex-wrap gap-4 sm:gap-6 p-3 bg-muted/50 rounded-lg items-center justify-between">
                            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="match-case"
                                        checked={matchCase}
                                        onCheckedChange={setMatchCase}
                                    />
                                    <Label htmlFor="match-case" className="text-xs">Match Case</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="use-regex"
                                        checked={useRegex}
                                        onCheckedChange={(checked) => {
                                            setUseRegex(checked);
                                            if (checked) setWholeWord(false);
                                        }}
                                    />
                                    <Label htmlFor="use-regex" className="text-xs">Regular Expression</Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="whole-word"
                                        checked={wholeWord}
                                        onCheckedChange={setWholeWord}
                                        disabled={useRegex}
                                    />
                                    <Label htmlFor="whole-word" className={`text-xs ${useRegex ? "text-muted-foreground" : ""}`}>
                                        Whole Word Only
                                    </Label>
                                </div>
                            </div>

                            {/* Fullscreen Button */}
                            <Button
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                variant={isFullscreen ? 'default' : 'outline'}
                                size="sm"
                                className="gap-1.5 text-xs h-8 font-medium"
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
                    </Card>

                    {/* Text Areas */}
                    <div className={`grid gap-4 sm:gap-6 md:grid-cols-2 ${isFullscreen ? 'flex-1 min-h-0' : ''}`}>
                        {/* Input */}
                        <Card className={`p-4 flex flex-col ${isFullscreen ? 'flex-1 min-h-0' : 'h-[500px]'}`}>
                            <div className="flex justify-between items-center mb-3">
                                <Label className="text-xs font-semibold">Source Text</Label>
                                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setInputText('')} disabled={!inputText}>
                                    Clear
                                </Button>
                            </div>
                            <Textarea
                                placeholder="Paste your source text here..."
                                className="flex-1 font-mono text-sm resize-none focus:outline-none"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                            />
                        </Card>

                        {/* Output */}
                        <Card className={`p-4 flex flex-col border-primary/20 bg-primary/5 ${isFullscreen ? 'flex-1 min-h-0' : 'h-[500px]'}`}>
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-3">
                                    <Label className="text-xs font-semibold">Result</Label>
                                    {result.count > 0 && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium">
                                            {result.count} replacements
                                        </span>
                                    )}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5 h-7 text-xs"
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
                                className="flex-1 font-mono text-sm resize-none bg-background/50 focus:outline-none"
                                value={result.text}
                            />
                        </Card>
                    </div>
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

            {/* Privacy Guarantee Banner */}
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 w-full text-center border-t border-dashed mt-8">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-muted/50 text-sm text-muted-foreground">
                    <span>🔒</span>
                    <span>100% Client-Side: Your text never leaves your device.</span>
                </div>
            </div>
        </div>
    );
}
