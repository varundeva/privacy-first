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
    RefreshCw,
    Fingerprint,
    Type,
    Lightbulb,
    HelpCircle
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import MD5 from 'crypto-js/md5';

interface Md5GeneratorProps {
    title: string;
    description: string;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
}

export function Md5Generator({ title, description, features, useCases, faq }: Md5GeneratorProps) {
    const [input, setInput] = useState('');
    const [uppercase, setUppercase] = useState(false);
    const [copied, setCopied] = useState(false);

    const generateHash = (text: string) => {
        if (!text) return '';
        const hash = MD5(text).toString();
        return uppercase ? hash.toUpperCase() : hash;
    };

    const output = generateHash(input);

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

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <ToolHeader title={title} description={description} />

            <main className="flex-1 mx-auto max-w-4xl px-4 py-8 sm:px-6 w-full space-y-8">
                <Card className="p-6 space-y-6">
                    {/* Input */}
                    <div className="space-y-3">
                        <Label htmlFor="input" className="text-base font-medium flex items-center gap-2">
                            <Type className="h-4 w-4 text-muted-foreground" />
                            Input Text
                        </Label>
                        <Textarea
                            id="input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Enter text to hash..."
                            className="min-h-[120px] font-mono resize-y"
                        />
                    </div>

                    {/* Options */}
                    <div className="flex items-center space-x-2">
                        <Switch id="uppercase" checked={uppercase} onCheckedChange={setUppercase} />
                        <Label htmlFor="uppercase">Uppercase Hash</Label>
                    </div>

                    {/* Output */}
                    <div className="space-y-3">
                        <Label htmlFor="output" className="text-base font-medium flex items-center gap-2">
                            <Fingerprint className="h-4 w-4 text-primary" />
                            MD5 Hash
                        </Label>
                        <div className="relative">
                            <div className="min-h-[60px] p-4 rounded-md bg-muted font-mono text-sm break-all flex items-center shadow-inner border">
                                {output || <span className="text-muted-foreground italic">Result will appear here...</span>}
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-background/80"
                                onClick={handleCopy}
                                disabled={!output}
                                title="Copy Hash"
                            >
                                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                        {output && (
                            <div className="text-xs text-muted-foreground text-right">
                                Length: {output.length} chars
                            </div>
                        )}
                    </div>
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
