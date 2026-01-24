'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ToolHeader } from '../ToolHeader';
import {
    Copy,
    RotateCcw,
    Link as LinkIcon,
    Check,
    Lightbulb,
    HelpCircle,
    ArrowRight,
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

interface TextToSlugProps {
    title: string;
    description: string;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
}

export function TextToSlug({ title, description, features, useCases, faq }: TextToSlugProps) {
    const [inputText, setInputText] = useState('');
    const [slugText, setSlugText] = useState('');
    const [separator, setSeparator] = useState('hyphen'); // hyphen, underscore
    const [keepCase, setKeepCase] = useState(false);
    const [removeStopWords, setRemoveStopWords] = useState(false);

    // Stop words list (common English stop words)
    const STOP_WORDS = new Set([
        'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'
    ]);

    useEffect(() => {
        if (!inputText) {
            setSlugText('');
            return;
        }

        let result = inputText;

        // 0. Remove stop words if enabled
        if (removeStopWords) {
            result = result.split(/\s+/)
                .filter(word => !STOP_WORDS.has(word.toLowerCase()))
                .join(' ');
        }

        // 1. Normalize unicode characters (e.g. é -> e)
        result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        // 2. Remove non-alphanumeric chars (except spaces)
        result = result.replace(/[^a-zA-Z0-9\s-_]/g, '');

        // 3. Trim
        result = result.trim();

        // 4. Case
        if (!keepCase) {
            result = result.toLowerCase();
        }

        // 5. Replace spaces/separators with chosen separator
        const sep = separator === 'hyphen' ? '-' : '_';
        result = result.replace(/[\s-_]+/g, sep);

        // 6. Remove leading/trailing separators
        if (result.startsWith(sep)) result = result.slice(1);
        if (result.endsWith(sep)) result = result.slice(0, -1);

        setSlugText(result);
    }, [inputText, separator, keepCase, removeStopWords]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(slugText);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const handleReset = () => {
        setInputText('');
        setSlugText('');
        setSeparator('hyphen');
        setKeepCase(false);
        setRemoveStopWords(false);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <ToolHeader title={title} description={description} />

            <main className="flex-1 mx-auto max-w-5xl px-4 py-8 sm:px-6 w-full space-y-8">
                {/* Controls */}
                <Card className="p-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {/* Separator */}
                        <div className="space-y-3">
                            <Label>Separator</Label>
                            <RadioGroup value={separator} onValueChange={setSeparator} className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="hyphen" id="hyphen" />
                                    <Label htmlFor="hyphen">Hyphen (-)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="underscore" id="underscore" />
                                    <Label htmlFor="underscore">Underscore (_)</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Options */}
                        <div className="space-y-3">
                            <Label>Options</Label>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="keep-case"
                                        checked={keepCase}
                                        onCheckedChange={setKeepCase}
                                    />
                                    <Label htmlFor="keep-case">Preserve case (e.g. MySlug)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="stop-words"
                                        checked={removeStopWords}
                                        onCheckedChange={setRemoveStopWords}
                                    />
                                    <Label htmlFor="stop-words">Remove stop words (a, the, and...)</Label>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Input/Output */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Input */}
                    <Card className="p-4 flex flex-col h-[400px]">
                        <div className="flex justify-between items-center mb-4">
                            <Label>Input Text</Label>
                            <Button variant="ghost" size="sm" onClick={() => setInputText('')} disabled={!inputText}>
                                Clear
                            </Button>
                        </div>
                        <Textarea
                            placeholder="Enter text to convert to slug..."
                            className="flex-1 font-sans text-lg p-4 resize-none"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                        />
                    </Card>

                    {/* Output */}
                    <Card className="p-4 flex flex-col h-[400px] border-primary/20 bg-primary/5">
                        <div className="flex justify-between items-center mb-4">
                            <Label>Generated Slug</Label>
                            <Button
                                variant="default"
                                size="sm"
                                className="gap-2 bg-purple-600 hover:bg-purple-700"
                                onClick={handleCopy}
                                disabled={!slugText}
                            >
                                <Copy className="h-3 w-3" />
                                Copy Slug
                            </Button>
                        </div>
                        <Textarea
                            readOnly
                            placeholder="Slug will match generated here..."
                            className="flex-1 font-mono text-lg p-4 resize-none bg-background/50 text-purple-700 dark:text-purple-300"
                            value={slugText}
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
                        <span className="text-2xl">🔗</span>
                        <div>
                            <h3 className="font-medium text-foreground">Clean URL Slugs</h3>
                            <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
                                Convert any text to SEO-friendly URL slugs instantly.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
