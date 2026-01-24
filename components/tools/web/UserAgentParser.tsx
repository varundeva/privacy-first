'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ToolHeader } from '../ToolHeader';
import { Label } from '@/components/ui/label';
import {
    Monitor,
    Smartphone,
    Cpu,
    Check,
    Copy,
    Trash2,
    RefreshCw,
    Layout,
    Laptop,
    Tablet,
    Globe,
    Shield,
    Lightbulb,
    HelpCircle
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { UAParser } from 'ua-parser-js';

interface UserAgentParserProps {
    title: string;
    description: string;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
}

export function UserAgentParser({ title, description, features, useCases, faq }: UserAgentParserProps) {
    const [input, setInput] = useState('');
    const [copied, setCopied] = useState(false);

    // Initial load: get current browser's UA
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setInput(window.navigator.userAgent);
        }
    }, []);

    const parsedUA = useMemo(() => {
        if (!input.trim()) return null;
        const parser = new UAParser(input);
        return {
            browser: parser.getBrowser(),
            os: parser.getOS(),
            device: parser.getDevice(),
            engine: parser.getEngine(),
            cpu: parser.getCPU(),
            ua: parser.getUA()
        };
    }, [input]);

    const handleCopy = async () => {
        if (!input) return;
        try {
            await navigator.clipboard.writeText(input);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const handleClear = () => setInput('');
    const handleReset = () => {
        if (typeof window !== 'undefined') {
            setInput(window.navigator.userAgent);
        }
    };

    const getDeviceIcon = () => {
        const type = parsedUA?.device.type;
        if (type === 'mobile') return <Smartphone className="h-6 w-6" />;
        if (type === 'tablet') return <Tablet className="h-6 w-6" />;
        return <Laptop className="h-6 w-6" />;
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <ToolHeader title={title} description={description} />

            <main className="flex-1 mx-auto max-w-5xl px-4 py-8 sm:px-6 w-full space-y-8">
                <Card className="p-6 shadow-lg border-2 border-indigo-500/10">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="ua-input" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                User Agent String
                            </Label>
                            <div className="flex gap-2">
                                <Button size="sm" variant="ghost" className="h-8 gap-2 hover:bg-indigo-50" onClick={handleReset}>
                                    <RefreshCw className="h-3 w-3" />
                                    My User Agent
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8 gap-2 text-destructive hover:bg-destructive/10" onClick={handleClear}>
                                    <Trash2 className="h-3 w-3" />
                                    Clear
                                </Button>
                            </div>
                        </div>
                        <Textarea
                            id="ua-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Enter User Agent string..."
                            className="min-h-[100px] font-mono text-sm resize-none focus-visible:ring-indigo-500"
                        />
                    </div>
                </Card>

                {parsedUA && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Browser Info */}
                        <Card className="p-6 shadow-md hover:shadow-lg transition-shadow border-t-4 border-t-blue-500">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600">
                                    <Globe className="h-6 w-6" />
                                </div>
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Browser</span>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold">{parsedUA.browser.name || 'Unknown'}</h3>
                                <p className="text-sm text-muted-foreground">Version: {parsedUA.browser.version || 'Unknown'}</p>
                            </div>
                        </Card>

                        {/* OS Info */}
                        <Card className="p-6 shadow-md hover:shadow-lg transition-shadow border-t-4 border-t-purple-500">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600">
                                    <Monitor className="h-6 w-6" />
                                </div>
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Operating System</span>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold">{parsedUA.os.name || 'Unknown'}</h3>
                                <p className="text-sm text-muted-foreground">Version: {parsedUA.os.version || 'Unknown'}</p>
                            </div>
                        </Card>

                        {/* Device Info */}
                        <Card className="p-6 shadow-md hover:shadow-lg transition-shadow border-t-4 border-t-emerald-500">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600">
                                    {getDeviceIcon()}
                                </div>
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Device</span>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold">{parsedUA.device.vendor || 'Unknown'}</h3>
                                <p className="text-sm text-muted-foreground">Model: {parsedUA.device.model || 'Unknown'}</p>
                                <p className="text-xs font-medium px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full inline-block mt-1">
                                    Type: {parsedUA.device.type || 'desktop'}
                                </p>
                            </div>
                        </Card>

                        {/* Engine Info */}
                        <Card className="p-6 shadow-md border-t-2">
                            <div className="flex items-center gap-3 mb-4">
                                <Layout className="h-5 w-5 text-indigo-500" />
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Engine</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg font-bold">{parsedUA.engine.name || 'Unknown'}</p>
                                <p className="text-xs text-muted-foreground">Version: {parsedUA.engine.version || 'Unknown'}</p>
                            </div>
                        </Card>

                        {/* CPU Info */}
                        <Card className="p-6 shadow-md border-t-2">
                            <div className="flex items-center gap-3 mb-4">
                                <Cpu className="h-5 w-5 text-indigo-500" />
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">CPU Architecture</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg font-bold">{parsedUA.cpu.architecture || 'Unknown'}</p>
                            </div>
                        </Card>

                        {/* Security Info */}
                        <Card className="p-6 shadow-md border-t-2">
                            <div className="flex items-center gap-3 mb-4">
                                <Shield className="h-5 w-5 text-indigo-500" />
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Security</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs font-medium">
                                    <div className={`h-2 w-2 rounded-full ${input.includes('Spider') || input.includes('Bot') ? 'bg-amber-500' : 'bg-green-500'}`} />
                                    {input.includes('Spider') || input.includes('Bot') ? 'Detected as Bot/Spider' : 'Likely Human Browser'}
                                </div>
                                <p className="text-[10px] text-muted-foreground leading-tight italic">
                                    This information is derived from the User Agent string and may not be 100% accurate if the string is spoofed.
                                </p>
                            </div>
                        </Card>
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
        </div>
    );
}
