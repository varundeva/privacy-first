'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToolHeader } from '../ToolHeader';
import { Label } from '@/components/ui/label';
import {
    Link as LinkIcon,
    Copy,
    Check,
    Globe,
    Search,
    Hash,
    Shield,
    FolderOpen,
    Trash2,
    Info,
    Lightbulb,
    HelpCircle
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface UrlParserProps {
    title: string;
    description: string;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
}

export function UrlParser({ title, description, features, useCases, faq }: UrlParserProps) {
    const [input, setInput] = useState('');
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const parsedUrl = useMemo(() => {
        if (!input.trim()) return null;
        try {
            const url = new URL(input.startsWith('http') ? input : `https://${input}`);
            const queryParams: Record<string, string> = {};
            url.searchParams.forEach((value, key) => {
                queryParams[key] = value;
            });

            return {
                protocol: url.protocol,
                hostname: url.hostname,
                port: url.port || (url.protocol === 'https:' ? '443' : '80'),
                pathname: url.pathname,
                search: url.search,
                hash: url.hash,
                origin: url.origin,
                queryParams
            };
        } catch (err) {
            return null;
        }
    }, [input]);

    const handleCopy = async (text: string, key: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedKey(key);
            setTimeout(() => setCopiedKey(null), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const handleClear = () => setInput('');

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <ToolHeader title={title} description={description} />

            <main className="flex-1 mx-auto max-w-5xl px-4 py-8 sm:px-6 w-full space-y-8">
                <Card className="p-6 shadow-lg border-2 border-indigo-500/10">
                    <div className="space-y-4">
                        <Label htmlFor="url-input" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Enter URL
                        </Label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="url-input"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="https://example.com/path?query=value#hash"
                                    className="pl-10 h-12 focus-visible:ring-indigo-500"
                                />
                            </div>
                            <Button variant="ghost" size="icon" onClick={handleClear} className="h-12 w-12 text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </Card>

                {parsedUrl ? (
                    <div className="grid md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* URL Components */}
                        <Card className="md:col-span-2 p-6 shadow-md overflow-hidden">
                            <div className="flex items-center gap-2 mb-6 border-b pb-4">
                                <Globe className="h-5 w-5 text-indigo-500" />
                                <h2 className="text-lg font-bold">Base components</h2>
                            </div>
                            <div className="grid gap-4">
                                {[
                                    { label: 'Protocol', value: parsedUrl.protocol, icon: Shield },
                                    { label: 'Hostname', value: parsedUrl.hostname, icon: Globe },
                                    { label: 'Port', value: parsedUrl.port, icon: Info },
                                    { label: 'Pathname', value: parsedUrl.pathname, icon: FolderOpen },
                                    { label: 'Origin', value: parsedUrl.origin, icon: Globe },
                                    { label: 'Hash', value: parsedUrl.hash, icon: Hash },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors group">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.label}</span>
                                                <span className="text-sm font-mono truncate text-foreground">{item.value || '(none)'}</span>
                                            </div>
                                        </div>
                                        {item.value && (
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleCopy(item.value, item.label)}
                                            >
                                                {copiedKey === item.label ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Query Parameters */}
                        <Card className="p-6 shadow-md">
                            <div className="flex items-center gap-2 mb-6 border-b pb-4">
                                <Search className="h-5 w-5 text-indigo-500" />
                                <h2 className="text-lg font-bold">Query params</h2>
                            </div>
                            {Object.keys(parsedUrl.queryParams).length > 0 ? (
                                <div className="space-y-4">
                                    {Object.entries(parsedUrl.queryParams).map(([key, value]) => (
                                        <div key={key} className="space-y-1 p-3 rounded-lg bg-muted/40 group relative">
                                            <div className="flex justify-between items-start">
                                                <span className="text-xs font-bold text-indigo-600 truncate mr-6">{key}</span>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-6 w-6 absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                                                    onClick={() => handleCopy(value, `query-${key}`)}
                                                >
                                                    {copiedKey === `query-${key}` ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                                </Button>
                                            </div>
                                            <div className="text-xs font-mono break-all text-foreground pr-6">
                                                {value}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground italic gap-2 text-sm">
                                    <Search className="h-8 w-8 opacity-20" />
                                    No parameters found
                                </div>
                            )}
                        </Card>
                    </div>
                ) : input && (
                    <Card className="p-12 text-center text-muted-foreground border-dashed border-2 bg-muted/10">
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 rounded-full bg-destructive/10 text-destructive">
                                <Shield className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Invalid URL</h3>
                                <p className="text-sm">Please enter a valid URL to parse.</p>
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
        </div >
    );
}
