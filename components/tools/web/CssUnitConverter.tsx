'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToolHeader } from '../ToolHeader';
import { Label } from '@/components/ui/label';
import {
    Copy,
    Check,
    ArrowRightLeft,
    Monitor,
    Smartphone,
    Ruler,
    Settings2,
    Zap
} from 'lucide-react';

interface CssUnitConverterProps {
    title: string;
    description: string;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
}

export function CssUnitConverter({ title, description, features, useCases, faq }: CssUnitConverterProps) {
    const [pxValue, setPxValue] = useState('16');
    const [baseSize, setBaseSize] = useState('16');
    const [viewportWidth, setViewportWidth] = useState('1920');
    const [viewportHeight, setViewportHeight] = useState('1080');
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const conversions = useMemo(() => {
        const px = parseFloat(pxValue);
        const base = parseFloat(baseSize);
        const vW = parseFloat(viewportWidth);
        const vH = parseFloat(viewportHeight);

        if (isNaN(px) || isNaN(base)) return [];

        return [
            { label: 'REM', value: `${(px / base).toFixed(3)}rem`, desc: `Based on ${base}px base size` },
            { label: 'EM', value: `${(px / base).toFixed(3)}em`, desc: `Based on ${base}px parent size` },
            { label: 'Point (PT)', value: `${(px * 0.75).toFixed(2)}pt`, desc: 'Standard print unit (1pt = 1/72 inch)' },
            { label: 'Percent (%)', value: `${(px / base * 100).toFixed(1)}%`, desc: `Relative to ${base}px base` },
            { label: 'Viewport Width (VW)', value: `${(px / vW * 100).toFixed(3)}vw`, desc: `Based on ${vW}px viewport` },
            { label: 'Viewport Height (VH)', value: `${(px / vH * 100).toFixed(3)}vh`, desc: `Based on ${vH}px viewport` },
        ];
    }, [pxValue, baseSize, viewportWidth, viewportHeight]);

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

            <main className="flex-1 mx-auto max-w-5xl px-4 py-8 sm:px-6 w-full space-y-8">
                <div className="grid lg:grid-cols-[1fr_2fr] gap-8">
                    {/* Settings */}
                    <Card className="p-6 shadow-lg border-2 border-indigo-500/10 h-fit space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Settings2 className="h-5 w-5 text-indigo-500" />
                            <h2 className="text-sm font-bold uppercase tracking-wider">Configuration</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground uppercase">Base Font Size (PX)</Label>
                                <Input
                                    type="number"
                                    value={baseSize}
                                    onChange={(e) => setBaseSize(e.target.value)}
                                    className="h-10 focus-visible:ring-indigo-500"
                                />
                                <p className="text-[10px] text-muted-foreground italic">Commonly 16px</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground uppercase">Viewport Width (PX)</Label>
                                <Input
                                    type="number"
                                    value={viewportWidth}
                                    onChange={(e) => setViewportWidth(e.target.value)}
                                    className="h-10 focus-visible:ring-indigo-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-muted-foreground uppercase">Viewport Height (PX)</Label>
                                <Input
                                    type="number"
                                    value={viewportHeight}
                                    onChange={(e) => setViewportHeight(e.target.value)}
                                    className="h-10 focus-visible:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Converter */}
                    <Card className="p-8 shadow-lg border-2 border-indigo-500/10 flex flex-col">
                        <div className="flex items-center gap-2 mb-8 pb-4 border-b">
                            <Zap className="h-6 w-6 text-yellow-500" />
                            <h2 className="text-xl font-bold italic tracking-tight">Rapid Unit Converter</h2>
                        </div>

                        <div className="space-y-8 flex-1">
                            <div className="space-y-3">
                                <Label className="text-sm font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Ruler className="h-4 w-4" /> Pixel Value (Input)
                                </Label>
                                <div className="relative group">
                                    <Input
                                        type="number"
                                        value={pxValue}
                                        onChange={(e) => setPxValue(e.target.value)}
                                        className="h-20 text-4xl font-black bg-muted/30 border-2 border-dashed border-indigo-500/20 focus:border-indigo-500/50 transition-all text-center"
                                        autoFocus
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground/30 pointer-events-none group-focus-within:text-indigo-500/20">PX</div>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                {conversions.map((item) => (
                                    <div key={item.label} className="group relative p-4 rounded-xl border border-indigo-500/10 bg-muted/10 hover:bg-indigo-50/20 hover:border-indigo-500/30 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none">{item.label}</span>
                                                <span className="text-[9px] text-muted-foreground mt-1">{item.desc}</span>
                                            </div>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleCopy(item.value, item.label)}
                                            >
                                                {copiedKey === item.label ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                                            </Button>
                                        </div>
                                        <div className="text-2xl font-black tracking-tight font-mono">
                                            {item.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}
