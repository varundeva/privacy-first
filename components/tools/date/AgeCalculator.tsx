'use client';

import { useState, useMemo } from 'react';
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
    PartyPopper,
    Cake,
    Hourglass,
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

interface AgeCalculatorProps {
    title: string;
    description: string;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
}

export function AgeCalculator({ title, description, features, useCases, faq }: AgeCalculatorProps) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    const stats = useMemo(() => {
        if (!startDate || !endDate) return null;

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

        // Ensure start is before end or handle negative? 
        // Age usually implies positive time. We'll use abs diff but for "Age" breakdown we assume start -> end order.
        if (start > end) return null; // Or show error

        // Exact Age Calculation
        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        let days = end.getDate() - start.getDate();

        if (days < 0) {
            months--;
            // Days in previous month of end date
            const prevMonthDate = new Date(end.getFullYear(), end.getMonth(), 0);
            days += prevMonthDate.getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        // Next Birthday (relative to End Date)
        const currentYearBirthday = new Date(end.getFullYear(), start.getMonth(), start.getDate());
        let nextBirthday = currentYearBirthday;
        if (end > currentYearBirthday) {
            nextBirthday = new Date(end.getFullYear() + 1, start.getMonth(), start.getDate());
        }

        const nextBirthdayDiff = nextBirthday.getTime() - end.getTime();
        const nextBirthdayDays = Math.ceil(nextBirthdayDiff / (1000 * 60 * 60 * 24));
        const nextBirthdayDayName = nextBirthday.toLocaleDateString('en-US', { weekday: 'long' });

        // Total stats
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const totalSeconds = Math.floor(diffTime / 1000);
        const totalMinutes = Math.floor(totalSeconds / 60);
        const totalHours = Math.floor(totalMinutes / 60);
        const totalDays = Math.floor(totalHours / 24);
        const totalWeeks = Math.floor(totalDays / 7);
        const totalMonths = (years * 12) + months; // simplified total months count

        return {
            age: { years, months, days },
            nextBirthday: {
                days: nextBirthdayDays,
                date: nextBirthday.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                dayName: nextBirthdayDayName
            },
            summary: {
                totalYears: (totalDays / 365.2425).toFixed(2),
                totalMonths,
                totalWeeks,
                totalDays,
                totalHours,
                totalMinutes,
                totalSeconds
            }
        };
    }, [startDate, endDate]);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <ToolHeader title={title} description={description} />

            <main className="flex-1 mx-auto max-w-5xl px-4 py-8 sm:px-6 w-full space-y-8">
                {/* Inputs */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="p-6">
                        <Label>Date of Birth (Start Date)</Label>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="mt-2 text-lg p-6"
                        />
                    </Card>
                    <Card className="p-6">
                        <Label>Age at Date (End Date)</Label>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="mt-2 text-lg p-6"
                        />
                    </Card>
                </div>

                {/* Results */}
                {stats && (
                    <div className="space-y-6">
                        {/* Main Age Card */}
                        <Card className="p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-100 dark:border-blue-900 shadow-lg">
                            <Label className="text-muted-foreground uppercase tracking-widest text-xs font-semibold">Exact Age</Label>
                            <div className="flex flex-wrap justify-center gap-4 text-3xl md:text-5xl font-bold text-blue-600 dark:text-blue-400 mt-6 mb-4">
                                {stats.age.years > 0 && <span className="flex flex-col items-center"><span className="tabular-nums">{stats.age.years}</span><span className="text-sm font-normal text-muted-foreground mt-1">Years</span></span>}
                                {stats.age.months > 0 && <span className="flex flex-col items-center"><span className="tabular-nums">{stats.age.months}</span><span className="text-sm font-normal text-muted-foreground mt-1">Months</span></span>}
                                <span className="flex flex-col items-center"><span className="tabular-nums">{stats.age.days}</span><span className="text-sm font-normal text-muted-foreground mt-1">Days</span></span>
                            </div>
                        </Card>

                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Detailed Stats */}
                            <Card className="p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600">
                                        <Hourglass className="h-6 w-6" />
                                    </div>
                                    <h3 className="font-semibold text-lg">Detailed Breakdown</h3>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Total Years', value: stats.summary.totalYears },
                                        { label: 'Total Months', value: stats.summary.totalMonths.toLocaleString() },
                                        { label: 'Total Weeks', value: stats.summary.totalWeeks.toLocaleString() },
                                        { label: 'Total Days', value: stats.summary.totalDays.toLocaleString() },
                                        { label: 'Total Hours', value: stats.summary.totalHours.toLocaleString() },
                                        { label: 'Total Minutes', value: stats.summary.totalMinutes.toLocaleString() },
                                        { label: 'Total Seconds', value: stats.summary.totalSeconds.toLocaleString() },
                                    ].map((item, i) => (
                                        <div key={i} className="flex justify-between items-center py-1 border-b last:border-0 border-dashed">
                                            <span className="text-muted-foreground text-sm">{item.label}</span>
                                            <span className="font-mono font-medium tabular-nums">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            {/* Next Birthday & Facts */}
                            <Card className="p-6 flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30 text-pink-600">
                                            <Cake className="h-6 w-6" />
                                        </div>
                                        <h3 className="font-semibold text-lg">Next Birthday</h3>
                                    </div>
                                    <div className="text-center py-8">
                                        <p className="text-5xl font-bold tabular-nums text-pink-500">{stats.nextBirthday.days}</p>
                                        <p className="text-muted-foreground text-sm mt-2 uppercase tracking-wide font-medium">Days Remaining</p>
                                        <div className="mt-6 inline-block py-2 px-4 rounded-full bg-secondary text-sm font-medium">
                                            {stats.nextBirthday.dayName}, {stats.nextBirthday.date}
                                        </div>
                                    </div>
                                </div>
                            </Card>
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
                        <span className="text-2xl">🎂</span>
                        <div>
                            <h3 className="font-medium text-foreground">Detailed Age Analysis</h3>
                            <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
                                Calculate your precise age down to the day and see interesting life statistics.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
