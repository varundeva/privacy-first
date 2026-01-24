'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ToolHeader } from '../ToolHeader';
import { Calendar } from '@/components/ui/calendar';
import {
    Copy,
    Calendar as CalendarIcon,
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

    const { result, holidayDates } = useMemo(() => {
        const holidaySet = new Set<string>();
        const holidayDateObjs: Date[] = [];

        if (holidays) {
            holidays.split(/[\n,]/).forEach(h => {
                const trimmed = h.trim();
                // Basic validation for YYYY-MM-DD
                if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
                    holidaySet.add(trimmed);
                    const [y, m, d] = trimmed.split('-').map(Number);
                    // Create date at noon to avoid timezone issues for display
                    holidayDateObjs.push(new Date(y, m - 1, d, 12, 0, 0));
                }
            });
        }

        if (!startDate || !endDate) return { result: null, holidayDates: holidayDateObjs };

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) return { result: null, holidayDates: holidayDateObjs };

        const isReverse = start > end;
        // Use UTC components to iterate safely match YYYY-MM-DD input
        // Parse input string directly to avoid timezone shift on 'new Date(string)' if we only use UTC methods
        // Actually, best to parse YYYY-MM-DD manually to create UTC Date
        const parseUTC = (str: string) => {
            const [y, m, d] = str.split('-').map(Number);
            return new Date(Date.UTC(y, m - 1, d));
        };

        const fromUTC = parseUTC(isReverse ? endDate : startDate);
        const toUTC = parseUTC(isReverse ? startDate : endDate);

        let count = 0;
        let weekends = 0;
        let holidayCount = 0;
        let calendarDays = 0;

        const curr = new Date(fromUTC);
        const limit = toUTC.getTime();

        while (curr.getTime() <= limit) {
            calendarDays++;

            // Generate YYYY-MM-DD string from UTC
            const y = curr.getUTCFullYear();
            const m = String(curr.getUTCMonth() + 1).padStart(2, '0');
            const d = String(curr.getUTCDate()).padStart(2, '0');
            const dateStr = `${y}-${m}-${d}`;

            const day = curr.getUTCDay(); // 0 = Sun, 6 = Sat

            const isWeekend = day === 0 || day === 6;
            const isHoliday = holidaySet.has(dateStr);

            if (excludeWeekends && isWeekend) {
                weekends++;
            } else if (isHoliday) {
                holidayCount++;
            } else {
                count++;
            }

            // Add 1 day safely
            curr.setUTCDate(curr.getUTCDate() + 1);
        }

        return {
            result: {
                businessDays: count,
                calendarDays,
                weekends,
                holidays: holidayCount,
                isReverse
            },
            holidayDates: holidayDateObjs
        };
    }, [startDate, endDate, excludeWeekends, holidays]);

    // Handle calendar selection
    const handleSelect = (selectedRange: any) => {
        // any used because DateRange type import might be tricky without direct dep, 
        // but structure is { from: Date, to?: Date }
        if (!selectedRange) {
            setStartDate('');
            setEndDate('');
            return;
        }

        const format = (d: Date) => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${dd}`;
        };

        if (selectedRange.from) {
            setStartDate(format(selectedRange.from));
            if (selectedRange.to) {
                setEndDate(format(selectedRange.to));
            } else {
                setEndDate(''); // or keep previous? usually range selection clears to if selecting new range
            }
        }
    };

    // Calculate the month to display
    const displayMonth = useMemo(() => {
        if (startDate) return new Date(startDate);
        return new Date();
    }, [startDate]);

    // Calendar Range logic
    const range = useMemo(() => {
        if (!startDate || !endDate) return undefined;
        let from = new Date(startDate);
        let to = new Date(endDate);
        if (isNaN(from.getTime()) || isNaN(to.getTime())) return undefined;

        // Fix dates to local noon to avoid midnight timezone edge cases in calendar display
        from = new Date(from.getFullYear(), from.getMonth(), from.getDate(), 12, 0, 0);
        to = new Date(to.getFullYear(), to.getMonth(), to.getDate(), 12, 0, 0);

        if (from > to) return { from: to, to: from };
        return { from, to };
    }, [startDate, endDate]);

    // Calculate the month to display and how many months to show
    const viewConfig = useMemo(() => {
        const today = new Date();
        if (!startDate) return { month: today, count: 1 };

        const start = new Date(startDate);
        if (isNaN(start.getTime())) return { month: today, count: 1 };

        let count = 1;
        if (endDate) {
            const end = new Date(endDate);
            if (!isNaN(end.getTime()) && end >= start) {
                const diff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
                count = Math.min(Math.max(diff, 1), 2); // Show up to 2 months side-by-side on desktop
            }
        }

        return { month: start, count };
    }, [startDate, endDate]);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <ToolHeader title={title} description={description} />

            <main className="flex-1 mx-auto max-w-6xl px-4 py-8 sm:px-6 w-full space-y-8">
                <div className="grid gap-8 lg:grid-cols-12">
                    {/* Left Column: Controls & Result */}
                    <div className="lg:col-span-5 space-y-6">
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

                        {/* Result Card */}
                        {result && (
                            <Card className="p-8 text-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-100 dark:border-amber-900">
                                <Label className="text-muted-foreground uppercase tracking-widest text-xs font-semibold">Total Business Days</Label>
                                <div className="text-6xl md:text-8xl font-bold text-amber-600 dark:text-amber-400 mt-2 mb-6">
                                    {result.businessDays}
                                </div>

                                <div className="flex justify-center flex-wrap gap-8 text-sm">
                                    <div>
                                        <p className="font-bold text-lg">{result.calendarDays}</p>
                                        <p className="text-muted-foreground">Total Days</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg text-red-500">{result.weekends}</p>
                                        <p className="text-muted-foreground">Weekends</p>
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg text-blue-500">{result.holidays}</p>
                                        <p className="text-muted-foreground">Holidays</p>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Right Column: Calendar */}
                    <div className="lg:col-span-7">
                        <Card className="p-6 h-full flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <CalendarIcon className="h-5 w-5" />
                                    Calendar View
                                </h3>
                                <div className="flex items-center gap-4 text-xs">
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                                        <span>Holiday</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 rounded-full bg-red-200 dark:bg-red-900/50" />
                                        <span>Weekend</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 flex justify-center calendars-container pointer-events-none">
                                <Calendar
                                    mode="range"
                                    selected={range}
                                    month={viewConfig.month}
                                    onMonthChange={() => { }}
                                    numberOfMonths={viewConfig.count}
                                    modifiers={{
                                        holiday: holidayDates,
                                        weekend: (date) => {
                                            const day = date.getDay();
                                            return excludeWeekends && (day === 0 || day === 6);
                                        }
                                    }}
                                    modifiersClassNames={{
                                        holiday: 'bg-blue-500 text-white hover:bg-blue-600 hover:text-white rounded-md',
                                        weekend: 'bg-red-100 text-red-900 hover:bg-red-200 dark:bg-red-950/50 dark:text-red-300',
                                        range_start: 'bg-amber-500 text-white hover:bg-amber-600',
                                        range_end: 'bg-amber-500 text-white hover:bg-amber-600',
                                        range_middle: 'bg-amber-100 dark:bg-amber-950/30'
                                    }}
                                    className="rounded-md border p-4 w-full flex justify-center"
                                    classNames={{
                                        months: "flex flex-col xl:flex-row space-y-4 xl:space-x-4 xl:space-y-0",
                                        month: "space-y-4",
                                        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                                        cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
                                    }}
                                />
                            </div>
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
