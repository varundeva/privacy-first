'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ToolHeader } from '../ToolHeader';
import {
    Copy,
    RotateCcw,
    Globe,
    Plus,
    X,
    Check,
    Lightbulb,
    HelpCircle,
    Clock,
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

interface TimeZoneConverterProps {
    title: string;
    description: string;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
}

const COMMON_ZONES = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'New York (EST/EDT)' },
    { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
    { value: 'Europe/London', label: 'London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Dubai', label: 'Dubai (GST)' },
    { value: 'Asia/Kolkata', label: 'India (IST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
    { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
    { value: 'America/Chicago', label: 'Chicago (CST/CDT)' },
    { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
    { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)' },
];

export function TimeZoneConverter({ title, description, features, useCases, faq }: TimeZoneConverterProps) {
    const [baseDate, setBaseDate] = useState(new Date());
    const [selectedZones, setSelectedZones] = useState<string[]>([
        Intl.DateTimeFormat().resolvedOptions().timeZone, // User's local
        'UTC',
        'America/New_York',
        'Europe/London',
        'Asia/Tokyo'
    ]);
    const [sliderValue, setSliderValue] = useState(0); // Minutes offset from baseDate start

    // Reset slider when base date changes drastically (not via slider)
    // Actually simplicity: Slider just adds minutes to the base "anchor".
    // Let's say anchor is midnight of currently selected day.

    // Better approach: State is purely the "Current Viewer Time". 
    // Slider modifies this time.

    const handleSliderChange = (val: number[]) => {
        const minutes = val[0];
        setSliderValue(minutes);

        // Update baseDate to modify time only
        const newDate = new Date(baseDate);
        newDate.setHours(Math.floor(minutes / 60));
        newDate.setMinutes(minutes % 60);
        setBaseDate(newDate);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (!val) return;
        setBaseDate(new Date(val));
        // Reset slider to match the new time
        const d = new Date(val);
        setSliderValue(d.getHours() * 60 + d.getMinutes());
    };

    const formatTimeInZone = (date: Date, zone: string) => {
        try {
            return new Intl.DateTimeFormat('en-US', {
                timeZone: zone,
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            }).format(date);
        } catch (e) {
            return 'Invalid Timezone';
        }
    };

    const getZoneTime = (date: Date, zone: string) => {
        try {
            return new Intl.DateTimeFormat('en-US', {
                timeZone: zone,
                hour: '2-digit',
                minute: '2-digit',
                hour12: false, // For internal calc if needed
            }).format(date);
        } catch (e) {
            return '--:--';
        }
    };

    const addZone = (zone: string) => {
        if (!selectedZones.includes(zone)) {
            setSelectedZones([...selectedZones, zone]);
        }
    };

    const removeZone = (zone: string) => {
        setSelectedZones(selectedZones.filter(z => z !== zone));
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <ToolHeader title={title} description={description} />

            <main className="flex-1 mx-auto max-w-5xl px-4 py-8 sm:px-6 w-full space-y-8">
                {/* Controls */}
                <Card className="p-6 space-y-6">
                    <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
                        <div className="space-y-2 w-full md:w-auto">
                            <Label>Base Date & Time</Label>
                            <Input
                                type="datetime-local"
                                value={baseDate.toISOString().slice(0, 16)}
                                onChange={handleDateChange}
                                className="w-full md:w-[250px]"
                            />
                        </div>

                        <div className="flex-1 w-full px-4 space-y-2">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>00:00</span>
                                <span>12:00</span>
                                <span>23:59</span>
                            </div>
                            <Slider
                                value={[sliderValue]}
                                min={0}
                                max={1439} // 24 * 60 - 1
                                step={15}
                                onValueChange={handleSliderChange}
                                className="cursor-pointer"
                            />
                            <p className="text-center text-sm font-medium text-blue-600 dark:text-blue-400">
                                {Math.floor(sliderValue / 60).toString().padStart(2, '0')}:{(sliderValue % 60).toString().padStart(2, '0')} Adjustment
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Select onValueChange={addZone}>
                            <SelectTrigger className="w-[280px]">
                                <SelectValue placeholder="Add a city/timezone..." />
                            </SelectTrigger>
                            <SelectContent>
                                {COMMON_ZONES.map(z => (
                                    <SelectItem key={z.value} value={z.value} disabled={selectedZones.includes(z.value)}>
                                        {z.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </Card>

                {/* Time Zones List */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {selectedZones.map((zone) => {
                        let timeStr = '--:--';
                        let dateStr = 'Invalid Zone';

                        try {
                            timeStr = new Intl.DateTimeFormat('en-US', {
                                timeZone: zone,
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                            }).format(baseDate);

                            dateStr = new Intl.DateTimeFormat('en-US', {
                                timeZone: zone,
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric'
                            }).format(baseDate);
                        } catch (e) {
                            // Keep default error state
                        }

                        // Extract parts strictly
                        const isLocal = zone === Intl.DateTimeFormat().resolvedOptions().timeZone;

                        return (
                            <Card key={zone} className={`p-4 flex flex-col justify-between transition-colors relative group h-[160px] ${isLocal ? 'border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-900/10' : ''}`}>
                                <div className="flex items-start justify-between w-full">
                                    <div className="flex items-start gap-3 overflow-hidden">
                                        <div className="mt-1 p-1.5 rounded-full bg-muted flex-shrink-0">
                                            <Globe className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-base truncate pr-2" title={zone}>{zone.split('/')[1]?.replace('_', ' ') || zone}</h3>
                                            <p className="text-xs text-muted-foreground truncate" title={zone}>{zone}</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => removeZone(zone)} className="h-6 w-6 -mr-1 -mt-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>

                                <div className="mt-4">
                                    <p className="text-3xl font-bold tabular-nums tracking-tight text-foreground">
                                        {timeStr}
                                    </p>
                                    <div className="flex items-center justify-between mt-1">
                                        <p className="text-xs text-muted-foreground font-medium uppercase">
                                            {dateStr}
                                        </p>
                                        {isLocal && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100/80 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-bold tracking-wider">YOU</span>}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
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
                        <span className="text-2xl">🌍</span>
                        <div>
                            <h3 className="font-medium text-foreground">Global Time</h3>
                            <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
                                Compare time zones instantly. All calculations handled locally by your browser.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
