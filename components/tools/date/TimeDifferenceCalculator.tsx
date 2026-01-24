'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToolHeader } from '../ToolHeader';
import {
    Copy,
    RotateCcw,
    Calendar,
    Clock,
    Check,
    Lightbulb,
    HelpCircle,
    ArrowRight,
    ArrowRightLeft,
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

interface TimeDifferenceCalculatorProps {
    title: string;
    description: string;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
}

export function TimeDifferenceCalculator({ title, description, features, useCases, faq }: TimeDifferenceCalculatorProps) {
    // Default start to today 00:00
    // Default end to today + 1 day 00:00
    const getTodayStr = () => new Date().toISOString().slice(0, 16);

    const [startDate, setStartDate] = useState(getTodayStr());
    const [endDate, setEndDate] = useState(getTodayStr());

    const result = useMemo(() => {
        if (!startDate || !endDate) return null;

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

        let diffMs = end.getTime() - start.getTime();
        const isNegative = diffMs < 0;
        diffMs = Math.abs(diffMs);

        // Constants
        const SECOND = 1000;
        const MINUTE = 60 * SECOND;
        const HOUR = 60 * MINUTE;
        const DAY = 24 * HOUR;
        const YEAR = 365.25 * DAY; // Approx

        // Exact Duration Calculation (Years, Months, Days, Hours, Minutes)
        // This is tricky because months vary. Date-fns does this well, but let's try native approach 
        // by calculating date components difference.

        // Naive Total Units
        const totalSeconds = Math.floor(diffMs / SECOND);
        const totalMinutes = Math.floor(diffMs / MINUTE);
        const totalHours = Math.floor(diffMs / HOUR);
        const totalDays = Math.floor(diffMs / DAY);
        const totalWeeks = Math.floor(totalDays / 7);

        // Detailed Duration
        // Let's use simple math for typical 'Duration' (x days, y hours, z minutes)
        // ignoring calendar months/years precise variance for simplicity or implement robust logic?
        // Let's implement robust logic using Date objects.

        // Clone start date to increment it until we reach end date
        let tempDate = isNegative ? new Date(end) : new Date(start);
        const targetDate = isNegative ? new Date(start) : new Date(end);

        // Years
        let years = targetDate.getFullYear() - tempDate.getFullYear();
        let months = targetDate.getMonth() - tempDate.getMonth();
        let days = targetDate.getDate() - tempDate.getDate();
        let hours = targetDate.getHours() - tempDate.getHours();
        let minutes = targetDate.getMinutes() - tempDate.getMinutes();
        let seconds = targetDate.getSeconds() - tempDate.getSeconds();

        // Adjust for negative values by borrowing from larger unit
        if (seconds < 0) {
            minutes--;
            seconds += 60;
        }
        if (minutes < 0) {
            hours--;
            minutes += 60;
        }
        if (hours < 0) {
            days--;
            hours += 24;
        }
        if (days < 0) {
            months--;
            // Days in previous month of target
            const prevMonthDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0);
            days += prevMonthDate.getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        return {
            isNegative,
            years, months, days, hours, minutes, seconds,
            totalSeconds, totalMinutes, totalHours, totalDays, totalWeeks
        };

    }, [startDate, endDate]);

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
                {/* Inputs */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="p-6">
                        <div className="space-y-4">
                            <Label className="text-lg font-semibold flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-blue-500" />
                                Start Date & Time
                            </Label>
                            <Input
                                type="datetime-local"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="text-lg p-6"
                            />
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="space-y-4">
                            <Label className="text-lg font-semibold flex items-center gap-2">
                                <Clock className="h-5 w-5 text-purple-500" />
                                End Date & Time
                            </Label>
                            <Input
                                type="datetime-local"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="text-lg p-6"
                            />
                        </div>
                    </Card>
                </div>

                {/* Results */}
                {result && (
                    <div className="space-y-6">
                        <Card className="p-8 text-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                            <Label className="text-muted-foreground uppercase tracking-widest text-xs font-semibold mb-4 block">
                                Duration {result.isNegative && '(Negative)'}
                            </Label>
                            <div className="flex flex-wrap justify-center gap-4 text-3xl md:text-5xl font-bold text-green-700 dark:text-green-300">
                                {result.years > 0 && <span className="flex flex-col items-center"><span className="tabular-nums">{result.years}</span><span className="text-sm font-normal text-muted-foreground mt-1">Years</span></span>}
                                {result.years > 0 && <span className="opacity-30">/</span>}

                                {result.months > 0 && <span className="flex flex-col items-center"><span className="tabular-nums">{result.months}</span><span className="text-sm font-normal text-muted-foreground mt-1">Months</span></span>}
                                {result.months > 0 && <span className="opacity-30">/</span>}

                                <span className="flex flex-col items-center"><span className="tabular-nums">{result.days}</span><span className="text-sm font-normal text-muted-foreground mt-1">Days</span></span>
                                <span className="opacity-30">/</span>

                                <span className="flex flex-col items-center"><span className="tabular-nums">{result.hours}</span><span className="text-sm font-normal text-muted-foreground mt-1">Hours</span></span>
                                <span className="opacity-30">:</span>
                                <span className="flex flex-col items-center"><span className="tabular-nums">{result.minutes}</span><span className="text-sm font-normal text-muted-foreground mt-1">Mins</span></span>
                            </div>
                        </Card>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {[
                                { label: 'Total Days', value: result.totalDays.toLocaleString(), unit: 'days' },
                                { label: 'Total Hours', value: result.totalHours.toLocaleString(), unit: 'hours' },
                                { label: 'Total Minutes', value: result.totalMinutes.toLocaleString(), unit: 'mins' },
                                { label: 'Total Seconds', value: result.totalSeconds.toLocaleString(), unit: 'secs' },
                            ].map((item, i) => (
                                <Card key={i} className="p-4 text-center hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => handleCopy(item.value.toString().replace(/,/g, ''))}>
                                    <p className="text-sm text-muted-foreground font-medium">{item.label}</p>
                                    <p className="text-2xl font-bold mt-1 tabular-nums">{item.value}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{item.unit}</p>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

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
                        <span className="text-2xl">⏳</span>
                        <div>
                            <h3 className="font-medium text-foreground">Duration Calculator</h3>
                            <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
                                Calculate the exact span between any two moments in time with precision.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
