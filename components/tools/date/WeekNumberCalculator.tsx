'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ToolHeader } from '../ToolHeader';
import {
    Copy,
    Calendar,
    Check,
    Lightbulb,
    HelpCircle,
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

interface WeekNumberCalculatorProps {
    title: string;
    description: string;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
}

export function WeekNumberCalculator({ title, description, features, useCases, faq }: WeekNumberCalculatorProps) {
    const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);

    // Calculate week number
    const getISOWeek = (dateFunc: Date) => {
        const date = new Date(dateFunc.valueOf());
        const dayNr = (date.getDay() + 6) % 7;
        date.setDate(date.getDate() - dayNr + 3);
        const firstThursday = date.valueOf();
        date.setMonth(0, 1);
        if (date.getDay() !== 4) {
            date.setMonth(0, 1 + ((4 - date.getDay()) + 7) % 7);
        }
        return 1 + Math.ceil((firstThursday - date.valueOf()) / 604800000);
    };

    const getWeekData = (dateStr: string) => {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return null;

        const weekNum = getISOWeek(d);
        const totalWeeks = getISOWeek(new Date(d.getFullYear(), 11, 28)); // Weeks in current year

        // Calculate week range (start Monday - end Sunday)
        const curr = new Date(d);
        const first = curr.getDate() - curr.getDay() + 1; // First day is the day of the month - the day of the week + 1
        const monday = new Date(curr.setDate(first)); // This might need adjustment for Sunday (0)
        // Adjust for ISO (Monday start)
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        const weekStart = new Date(d.setDate(diff));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        return {
            week: weekNum,
            year: d.getFullYear(), // Note: ISO year might be different, keeping simple
            range: `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`,
            pct: Math.round((weekNum / 52) * 100) // Approx
        };
    };

    const currentWeek = useMemo(() => getWeekData(new Date().toISOString().split('T')[0]), []);
    const selectedWeek = useMemo(() => getWeekData(dateInput), [dateInput]);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <ToolHeader title={title} description={description} />

            <main className="flex-1 mx-auto max-w-5xl px-4 py-8 sm:px-6 w-full space-y-8">
                {/* Current Week Hero */}
                <Card className="p-8 text-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-100 dark:border-indigo-900">
                    <Label className="text-muted-foreground uppercase tracking-widest text-xs font-semibold">Current Week Number</Label>
                    <div className="text-6xl md:text-8xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                        {currentWeek?.week}
                    </div>
                    <p className="text-muted-foreground mt-4">{currentWeek?.range}</p>
                </Card>

                {/* Calculator */}
                <Card className="p-6">
                    <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                        <div className="space-y-4 flex-1 w-full">
                            <Label>Select Date</Label>
                            <Input
                                type="date"
                                value={dateInput}
                                onChange={(e) => setDateInput(e.target.value)}
                                className="text-lg p-6 w-full"
                            />
                        </div>

                        <div className="flex-1 w-full flex flex-col items-center justify-center p-6 bg-muted rounded-xl">
                            {selectedWeek ? (
                                <>
                                    <span className="text-sm font-medium text-muted-foreground uppercase">IS0 8601 Week</span>
                                    <span className="text-5xl font-bold mt-2">{selectedWeek.week}</span>
                                    <span className="text-sm text-muted-foreground mt-2">{selectedWeek.range}</span>
                                </>
                            ) : (
                                <span className="text-muted-foreground">Invalid Date</span>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Features & FAQ Section */}
                {((features && features.length > 0) || (useCases && useCases.length > 0) || (faq && faq.length > 0)) && (
                    <div className="grid gap-8 pt-8 border-t">
                        <div className="grid gap-8 md:grid-cols-2">
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
                        <span className="text-2xl">📆</span>
                        <div>
                            <h3 className="font-medium text-foreground">Week Calculator</h3>
                            <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
                                accurate ISO 8601 week numbers.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
