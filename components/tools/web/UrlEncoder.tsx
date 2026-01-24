'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ToolHeader } from '../ToolHeader';
import { Label } from '@/components/ui/label';
import {
    Copy,
    Check,
    Link,
    ArrowRightLeft,
    Trash2,
    RefreshCw,
    Code,
    Type,
    Lightbulb,
    HelpCircle
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UrlEncoderProps {
    title: string;
    description: string;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
}

export function UrlEncoder({ title, description, features, useCases, faq }: UrlEncoderProps) {
    const [mode, setMode] = useState<'encode' | 'decode'>('encode');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleProcess = () => {
        if (!input.trim()) {
            setOutput('');
            setError(null);
            return;
        }

        try {
            if (mode === 'encode') {
                setOutput(encodeURIComponent(input));
            } else {
                setOutput(decodeURIComponent(input));
            }
            setError(null);
        } catch (err) {
            setError(mode === 'encode' ? 'Error encoding URL' : 'Invalid URL-encoded string');
            setOutput('');
        }
    };

    const handleCopy = async () => {
        if (!output) return;
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const handleReset = () => {
        setInput('');
        setOutput('');
        setError(null);
    };

    const handleSwap = () => {
        if (output) {
            setInput(output);
            setOutput('');
            setMode(mode === 'encode' ? 'decode' : 'encode');
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <ToolHeader title={title} description={description} />

            <main className="flex-1 mx-auto max-w-4xl px-4 py-8 sm:px-6 w-full space-y-8">
                <Card className="p-6 shadow-lg border-2 border-indigo-500/10">
                    <Tabs value={mode} onValueChange={(v) => setMode(v as 'encode' | 'decode')} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-8">
                            <TabsTrigger value="encode" className="gap-2">
                                <Code className="h-4 w-4" />
                                Encode
                            </TabsTrigger>
                            <TabsTrigger value="decode" className="gap-2">
                                <Type className="h-4 w-4" />
                                Decode
                            </TabsTrigger>
                        </TabsList>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="input" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                    {mode === 'encode' ? 'Plain Text' : 'Encoded String'}
                                </Label>
                                <Textarea
                                    id="input"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter encoded string to decode...'}
                                    className="min-h-[150px] font-mono text-base resize-none focus-visible:ring-indigo-500"
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button onClick={handleProcess} className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-md">
                                    <RefreshCw className="h-4 w-4" />
                                    {mode === 'encode' ? 'Encode' : 'Decode'}
                                </Button>
                                {output && (
                                    <Button variant="outline" onClick={handleSwap} className="gap-2 border-indigo-200">
                                        <ArrowRightLeft className="h-4 w-4" />
                                        Swap Input/Output
                                    </Button>
                                )}
                                <Button variant="ghost" onClick={handleReset} className="gap-2 text-destructive hover:bg-destructive/10">
                                    <Trash2 className="h-4 w-4" />
                                    Clear
                                </Button>
                            </div>

                            {error && (
                                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-1">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4 pt-4 border-t border-border">
                                <div className="flex justify-between items-center">
                                    <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Result</Label>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 gap-2 hover:bg-indigo-50"
                                        onClick={handleCopy}
                                        disabled={!output}
                                    >
                                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                        {copied ? 'Copied' : 'Copy'}
                                    </Button>
                                </div>
                                <div className={`min-h-[100px] p-4 rounded-lg bg-muted/50 font-mono text-sm break-all border border-border transition-all ${output ? 'text-foreground' : 'text-muted-foreground italic'}`}>
                                    {output || 'Result will appear here...'}
                                </div>
                            </div>
                        </div>
                    </Tabs>
                </Card>

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
        </div>
    );
}
