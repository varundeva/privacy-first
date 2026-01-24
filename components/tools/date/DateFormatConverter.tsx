'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolHeader } from '../ToolHeader';
import {
    Copy,
    RotateCcw,
    Calendar,
    Check,
    Lightbulb,
    HelpCircle,
    ArrowRight,
    Type,
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

interface DateFormatConverterProps {
    title: string;
    description: string;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
}

export function DateFormatConverter({ title, description, features, useCases, faq }: DateFormatConverterProps) {
    const [inputDate, setInputDate] = useState(new Date().toString());
    const [status, setStatus] = useState<'valid' | 'invalid'>('valid');

    const FORMATS = [
        { name: 'ISO 8601', example: '2024-01-24T13:30:00.000Z', get: (d: Date) => d.toISOString() },
        { name: 'UTC String', example: 'Sat, 24 Jan 2024 13:30:00 GMT', get: (d: Date) => d.toUTCString() },
        { name: 'Date String', example: 'Sat Jan 24 2024', get: (d: Date) => d.toDateString() },
        { name: 'Time String', example: '13:30:00 GMT+0000', get: (d: Date) => d.toTimeString() },
        { name: 'Locale Date', example: '1/24/2024', get: (d: Date) => d.toLocaleDateString() },
        { name: 'Locale Time', example: '1:30:00 PM', get: (d: Date) => d.toLocaleTimeString() },
        { name: 'Unix Timestamp (s)', example: '1706103000', get: (d: Date) => Math.floor(d.getTime() / 1000).toString() },
        { name: 'Unix Timestamp (ms)', example: '1706103000000', get: (d: Date) => d.getTime().toString() },
        { name: 'JSON', example: '"2024-01-24T13:30:00.000Z"', get: (d: Date) => d.toJSON() },
    ];

    const results = useMemo(() => {
        const d = new Date(inputDate);
        if (isNaN(d.getTime())) {
            return [];
        }
        return FORMATS.map(f => ({ name: f.name, value: f.get(d) }));
    }, [inputDate]);

    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <ToolHeader title={title} description={description} />

            <main className="flex-1 mx-auto max-w-5xl px-4 py-8 sm:px-6 w-full space-y-8">
                {/* Input */}
                <Card className="p-6">
                    <div className="space-y-4">
                        <Label>Input Date</Label>
                        <div className="flex gap-4">
                            <Input
                                value={inputDate}
                                onChange={(e) => setInputDate(e.target.value)}
                                placeholder="Paste date string, timestamp, or ISO format..."
                                className="font-mono"
                            />
                            <Button variant="outline" onClick={() => setInputDate(new Date().toString())}>
                                Now
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Supports natural language like &quot;January 1, 2024&quot;, ISO &quot;2024-01-01&quot;, or timestamps.
                        </p>
                    </div>
                </Card>

                {/* Results Grid */}
                <div className="grid gap-4 md:grid-cols-2">
                    {results.length > 0 ? (
                        results.map((item, i) => (
                            <Card key={i} className="p-4 flex flex-col justify-between group hover:border-primary/50 transition-colors">
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground text-xs uppercase tracking-wider">{item.name}</Label>
                                    <p className="font-mono text-sm break-all">{item.value}</p>
                                </div>
                                <div className="flex justify-end mt-4">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleCopy(item.value)}
                                    >
                                        <Copy className="h-3 w-3" />
                                        Copy
                                    </Button>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="md:col-span-2 p-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                            Invalid Date Format
                        </div>
                    )}
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
                        <span className="text-2xl">📅</span>
                        <div>
                            <h3 className="font-medium text-foreground">Universal Parsing</h3>
                            <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
                                Transform any date format into standard ISO, UTC, or local formats instantly.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
