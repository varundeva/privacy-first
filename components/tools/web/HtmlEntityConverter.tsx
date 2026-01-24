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
    Code,
    Type,
    ArrowRightLeft,
    Trash2,
    RefreshCw
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HtmlEntityConverterProps {
    title: string;
    description: string;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
}

export function HtmlEntityConverter({ title, description, features, useCases, faq }: HtmlEntityConverterProps) {
    const [mode, setMode] = useState<'encode' | 'decode'>('encode');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [copied, setCopied] = useState(false);

    const handleProcess = () => {
        if (!input.trim()) {
            setOutput('');
            return;
        }

        if (mode === 'encode') {
            const div = document.createElement('div');
            div.textContent = input;
            setOutput(div.innerHTML);
        } else {
            const div = document.createElement('div');
            div.innerHTML = input;
            setOutput(div.textContent || '');
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
                                Encode Entities
                            </TabsTrigger>
                            <TabsTrigger value="decode" className="gap-2">
                                <Type className="h-4 w-4" />
                                Decode Entities
                            </TabsTrigger>
                        </TabsList>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="input" className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                    {mode === 'encode' ? 'Characters to Encode' : 'Entities to Decode'}
                                </Label>
                                <Textarea
                                    id="input"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={mode === 'encode' ? 'Enter text (e.g., <p>Hello world!</p>)...' : 'Enter entities (e.g., &lt;p&gt;Hello world!&lt;/p&gt;)...'}
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
            </main>
        </div>
    );
}
