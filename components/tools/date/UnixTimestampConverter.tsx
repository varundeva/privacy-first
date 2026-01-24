'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolHeader } from '../ToolHeader';
import {
    Copy,
    RotateCcw,
    Clock,
    Calendar,
    Check,
    Lightbulb,
    HelpCircle,
    ArrowRight,
    ArrowDown,
    ArrowUp,
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

interface UnixTimestampConverterProps {
    title: string;
    description: string;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
}

export function UnixTimestampConverter({ title, description, features, useCases, faq }: UnixTimestampConverterProps) {
    const [now, setNow] = useState(Math.floor(Date.now() / 1000));
    const [isPaused, setIsPaused] = useState(false);

    // Converter State
    const [inputTimestamp, setInputTimestamp] = useState<string>('');
    const [convertedDate, setConvertedDate] = useState<string>('');

    // Date to Timestamp State
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [day, setDay] = useState(new Date().getDate());
    const [hour, setHour] = useState(new Date().getHours());
    const [minute, setMinute] = useState(new Date().getMinutes());
    const [second, setSecond] = useState(new Date().getSeconds());
    const [generatedTimestamp, setGeneratedTimestamp] = useState<number | null>(null);

    // Live clock
    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(() => {
            setNow(Math.floor(Date.now() / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [isPaused]);

    // Initialize inputs
    useEffect(() => {
        if (!inputTimestamp) {
            setInputTimestamp(Math.floor(Date.now() / 1000).toString());
        }
    }, []);

    // Convert Timestamp -> Date
    const convertTimestamp = () => {
        try {
            const ts = parseInt(inputTimestamp);
            if (isNaN(ts)) {
                setConvertedDate('Invalid timestamp');
                return;
            }

            // Detect if seconds or milliseconds (naive check: if > 100 billion, assume ms)
            // 100000000000 is year 5138 in seconds, but 1973 in ms
            // Better heuristic: if > 3_000_000_000, likely MS? (That's year 2065 in seconds)
            // Or usually timestamps are 10 digits (seconds) or 13 digits (ms)

            let date: Date;
            if (inputTimestamp.length >= 13) {
                date = new Date(ts);
            } else {
                date = new Date(ts * 1000);
            }

            setConvertedDate(date.toUTCString() + ' (UTC)\n' + date.toString());
        } catch (e) {
            setConvertedDate('Invalid timestamp');
        }
    };

    // Convert Date -> Timestamp
    const generateTimestamp = () => {
        try {
            const date = new Date(year, month - 1, day, hour, minute, second);
            const ts = Math.floor(date.getTime() / 1000);
            setGeneratedTimestamp(ts);
        } catch (e) {
            setGeneratedTimestamp(null);
        }
    };

    const copyToClipboard = async (text: string) => {
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
                {/* Current Time Hero */}
                <Card className="p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-100 dark:border-blue-900">
                    <div className="flex flex-col items-center gap-4">
                        <Label className="text-muted-foreground uppercase tracking-widest text-xs font-semibold">Current Unix Timestamp</Label>
                        <div className="text-5xl md:text-7xl font-mono font-bold text-blue-600 dark:text-blue-400 tabular-nums tracking-tight">
                            {now}
                        </div>
                        <div className="flex gap-4 mt-2">
                            <Button
                                variant={isPaused ? "outline" : "secondary"}
                                size="sm"
                                onClick={() => setIsPaused(!isPaused)}
                                className="min-w-[80px]"
                            >
                                {isPaused ? 'Resume' : 'Pause'}
                            </Button>
                            <Button variant="default" size="sm" onClick={() => copyToClipboard(now.toString())}>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy
                            </Button>
                        </div>
                    </div>
                </Card>

                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Timestamp to Date Converter */}
                    <Card className="p-6 space-y-6">
                        <div className="flex items-center gap-2 border-b pb-4">
                            <Clock className="h-5 w-5 text-purple-500" />
                            <h2 className="text-xl font-semibold">Timestamp to Date</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Unix Timestamp</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={inputTimestamp}
                                        onChange={(e) => setInputTimestamp(e.target.value)}
                                        placeholder="Enter timestamp..."
                                        className="font-mono"
                                    />
                                    <Button onClick={convertTimestamp}>Convert</Button>
                                </div>
                                <p className="text-xs text-muted-foreground">Supports seconds (10 digits) and milliseconds (13 digits)</p>
                            </div>

                            {convertedDate && (
                                <div className="p-4 bg-muted rounded-lg space-y-2 border relative group">
                                    <Label className="text-xs uppercase text-muted-foreground">Result</Label>
                                    <div className="font-mono whitespace-pre-line text-sm">{convertedDate}</div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => copyToClipboard(convertedDate)}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Date to Timestamp Converter */}
                    <Card className="p-6 space-y-6">
                        <div className="flex items-center gap-2 border-b pb-4">
                            <Calendar className="h-5 w-5 text-green-500" />
                            <h2 className="text-xl font-semibold">Date to Timestamp</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Year</Label>
                                    <Input type="number" value={year} onChange={e => setYear(parseInt(e.target.value))} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Month</Label>
                                    <Input type="number" min={1} max={12} value={month} onChange={e => setMonth(parseInt(e.target.value))} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Day</Label>
                                    <Input type="number" min={1} max={31} value={day} onChange={e => setDay(parseInt(e.target.value))} />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Hour (24h)</Label>
                                    <Input type="number" min={0} max={23} value={hour} onChange={e => setHour(parseInt(e.target.value))} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Minute</Label>
                                    <Input type="number" min={0} max={59} value={minute} onChange={e => setMinute(parseInt(e.target.value))} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Second</Label>
                                    <Input type="number" min={0} max={59} value={second} onChange={e => setSecond(parseInt(e.target.value))} />
                                </div>
                            </div>

                            <Button className="w-full" onClick={generateTimestamp}>Generate Timestamp</Button>

                            {generatedTimestamp !== null && (
                                <div className="p-4 bg-muted rounded-lg flex items-center justify-between border">
                                    <div>
                                        <Label className="text-xs uppercase text-muted-foreground">Unix Timestamp</Label>
                                        <div className="font-mono text-xl font-bold text-green-600 dark:text-green-400">{generatedTimestamp}</div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(generatedTimestamp.toString())}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
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
                        <span className="text-2xl">⏰</span>
                        <div>
                            <h3 className="font-medium text-foreground">Precise Timing</h3>
                            <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
                                All conversions happen locally in your browser for zero latency and privacy.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
