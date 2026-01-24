'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ToolHeader } from '../ToolHeader';
import {
    Copy,
    Calendar,
    Briefcase,
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

interface BusinessDaysCalculatorProps {
    title: string;
    description: string;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
}

export function BusinessDaysCalculator({ title, description, features, useCases, faq }: BusinessDaysCalculatorProps) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [excludeWeekends, setExcludeWeekends] = useState(true);
    const [holidays, setHolidays] = useState(''); // comma or newline separated YYYY-MM-DD

    const result = useMemo(() => {
        if (!startDate || !endDate) return null;

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

        // Ensure start is before end for loop simplicity, or handle math
        const isReverse = start > end;
        const from = isReverse ? end : start;
        const to = isReverse ? start : end;

        // Parse holidays
        const holidaySet = new Set<string>();
        if (holidays) {
            holidays.split(/[\n,]/).forEach(h => {
                const trimmed = h.trim();
                if (trimmed) holidaySet.add(trimmed);
            });
        }

        let count = 0;
        let weekends = 0;
        let holidayCount = 0;
        let calendarDays = 0;

        const curr = new Date(from);
        // Important: Loop logic depends if we include start/end date?
        // Typically "Days between" means diff. Start 1st, End 2nd = 1 day?
        // If we want "Working days span" usually includes both start and end if they are working days.
        // Let's assume inclusive range for "Working Days" (e.g. Mon to Fri = 5 days)
        // But for "Difference", typically exclusive.
        // Let's do Inclusive Start, Exclusive End? No, usually business apps do Inclusive Start & End.
        // Let's do Inclusive Start & End?
        // Let's calculate typical "Days Difference" logic but skipping weekends.
        // Day 1: Mon. Day 2: Tue. Days = 2 (Mon, Tue).
        // Let's iterate until curr > to

        // Correct approach for 'Inclusive' count: loop from <= to

        const limit = new Date(to);

        while (curr <= limit) {
            calendarDays++;
            const day = curr.getDay(); // 0 = Sun, 6 = Sat
            const dateStr = curr.toISOString().split('T')[0];

            const isWeekend = day === 0 || day === 6;
            const isHoliday = holidaySet.has(dateStr);

            if (excludeWeekends && isWeekend) {
                weekends++;
            } else if (isHoliday) {
                holidayCount++; // Only count holiday if it's not a weekend (if already excluded) or count it anyway?
                // Usually if holiday falls on weekend it's already excluded.
                // Let's rely on else-if: duplicate holidays on weekends won't double decrease.
            } else {
                count++;
            }

            curr.setDate(curr.getDate() + 1);
        }

        return {
            businessDays: count,
            calendarDays,
            weekends,
            holidays: holidayCount,
            isReverse
        };
    }, [startDate, endDate, excludeWeekends, holidays]);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <ToolHeader title={title} description={description} />

            <main className="flex-1 mx-auto max-w-5xl px-4 py-8 sm:px-6 w-full space-y-8">
                {/* Inputs */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="p-6 space-y-4">
                        <Label>Date Range</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Start Date</Label>
                                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">End Date</Label>
                                <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <Switch checked={excludeWeekends} onCheckedChange={setExcludeWeekends} id="weekend-mode" />
                            <Label htmlFor="weekend-mode">Exclude Weekends (Sat, Sun)</Label>
                        </div>
                    </Card>

                    <Card className="p-6 space-y-2">
                        <Label>Holidays (Optional)</Label>
                        <p className="text-xs text-muted-foreground">Enter YYYY-MM-DD, one per line.</p>
                        <Textarea
                            value={holidays}
                            onChange={e => setHolidays(e.target.value)}
                            placeholder={`2024-01-01\n2024-12-25`}
                            className="font-mono h-[120px] resize-none"
                        />
                    </Card>
                </div>

                {/* Result */}
                {result && (
                    <Card className="p-8 text-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-100 dark:border-amber-900">
                        <Label className="text-muted-foreground uppercase tracking-widest text-xs font-semibold">Total Business Days</Label>
                        <div className="text-6xl md:text-8xl font-bold text-amber-600 dark:text-amber-400 mt-2 mb-6">
                            {result.businessDays}
                        </div>

                        <div className="flex justify-center flex-wrap gap-8 text-sm">
                            <div>
                                <p className="font-bold text-lg">{result.calendarDays}</p>
                                <p className="text-muted-foreground">Calendar Days</p>
                            </div>
                            <div>
                                <p className="font-bold text-lg text-red-500">{result.weekends}</p>
                                <p className="text-muted-foreground">Weekends</p>
                            </div>
                            <div>
                                <p className="font-bold text-lg text-red-500">{result.holidays}</p>
                                <p className="text-muted-foreground">Holidays</p>
                            </div>
                        </div>
                    </Card>
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
                        <span className="text-2xl">💼</span>
                        <div>
                            <h3 className="font-medium text-foreground">Worker Helper</h3>
                            <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
                                Calculate project deadlines and working days with ease.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
