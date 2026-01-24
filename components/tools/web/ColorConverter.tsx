'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToolHeader } from '../ToolHeader';
import { Label } from '@/components/ui/label';
import {
    Copy,
    Check,
    Palette,
    RefreshCw,
    Hash,
    Maximize,
    Pipette,
    Lightbulb,
    HelpCircle
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

interface ColorConverterProps {
    title: string;
    description: string;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
}

export function ColorConverter({ title, description, features, useCases, faq }: ColorConverterProps) {
    const [color, setColor] = useState('#6366f1'); // Default indigo-500
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    // Color conversion logic
    const colorResults = useMemo(() => {
        if (typeof window === 'undefined') return null;
        const div = document.createElement('div');
        div.style.color = color;
        // In some browsers, color is only applied if added to body
        document.body.appendChild(div);
        const rgb = window.getComputedStyle(div).color;
        document.body.removeChild(div);

        // Parse RGB
        const rgbMatch = rgb.match(/\d+/g);
        if (!rgbMatch) return null;
        const [r, g, b] = rgbMatch.map(Number);

        // RGB to HEX
        const toHex = (n: number) => n.toString(16).padStart(2, '0');
        const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

        // RGB to HSL
        const rNorm = r / 255;
        const gNorm = g / 255;
        const bNorm = b / 255;
        const max = Math.max(rNorm, gNorm, bNorm);
        const min = Math.min(rNorm, gNorm, bNorm);
        let h = 0, s = 0, l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case rNorm: h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0); break;
                case gNorm: h = (bNorm - rNorm) / d + 2; break;
                case bNorm: h = (rNorm - gNorm) / d + 4; break;
            }
            h /= 6;
        }
        const hsl = `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;

        // RGB to CMYK
        let k = 1 - Math.max(rNorm, gNorm, bNorm);
        let c = (1 - rNorm - k) / (1 - k) || 0;
        let m = (1 - gNorm - k) / (1 - k) || 0;
        let y = (1 - bNorm - k) / (1 - k) || 0;
        const cmyk = `cmyk(${Math.round(c * 100)}%, ${Math.round(m * 100)}%, ${Math.round(y * 100)}%, ${Math.round(k * 100)}%)`;

        return {
            hex,
            rgb: `rgb(${r}, ${g}, ${b})`,
            hsl,
            cmyk,
            raw: { r, g, b }
        };
    }, [color]);

    const handleCopy = async (text: string, key: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedKey(key);
            setTimeout(() => setCopiedKey(null), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <ToolHeader title={title} description={description} />

            <main className="flex-1 mx-auto max-w-4xl px-4 py-8 sm:px-6 w-full space-y-8">
                <div className="grid md:grid-cols-[1fr_2fr] gap-8">
                    {/* Color Picker */}
                    <Card className="p-6 shadow-lg border-2 border-indigo-500/10 h-fit">
                        <div className="space-y-6">
                            <div className="space-y-2 text-center">
                                <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block">Pick a color</Label>
                                <div className="relative group">
                                    <div
                                        className="h-40 rounded-xl shadow-inner border-4 border-white dark:border-zinc-800 transition-all duration-300 group-hover:scale-[1.02]"
                                        style={{ backgroundColor: color }}
                                    />
                                    <input
                                        type="color"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                                            <Pipette className="h-3 w-3" />
                                            Select Color
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="color-input" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Hex Value</Label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="color-input"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="pl-10 h-11 focus-visible:ring-indigo-500 font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Conversions */}
                    <Card className="p-8 shadow-lg border-2 border-indigo-500/10">
                        <div className="flex items-center gap-2 mb-8 pb-4 border-b">
                            <Palette className="h-5 w-5 text-indigo-500" />
                            <h2 className="text-xl font-bold">Color Formats</h2>
                        </div>

                        {colorResults ? (
                            <div className="grid gap-6">
                                {[
                                    { label: 'HEX', value: colorResults.hex },
                                    { label: 'RGB', value: colorResults.rgb },
                                    { label: 'HSL', value: colorResults.hsl },
                                    { label: 'CMYK', value: colorResults.cmyk },
                                ].map((item) => (
                                    <div key={item.label} className="group relative">
                                        <div className="flex justify-between items-end mb-1">
                                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{item.label}</span>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-6 gap-1.5 text-xs text-muted-foreground hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleCopy(item.value, item.label)}
                                            >
                                                {copiedKey === item.label ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                                {copiedKey === item.label ? 'Copied' : 'Copy'}
                                            </Button>
                                        </div>
                                        <div className="p-4 rounded-xl bg-muted/40 font-mono text-lg font-bold border border-transparent group-hover:border-indigo-500/20 group-hover:bg-indigo-50/10 transition-all">
                                            {item.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground italic gap-4">
                                <Maximize className="h-12 w-12 opacity-10 animate-pulse" />
                                <p>Calculating conversions...</p>
                            </div>
                        )}
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
            </main >
        </div >
    );
}
