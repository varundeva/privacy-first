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
    Lock,
    Key,
    ShieldCheck,
    XCircle,
    CheckCircle2,
    Lightbulb,
    HelpCircle
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import bcrypt from 'bcryptjs';

interface BcryptGeneratorProps {
    title: string;
    description: string;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
}

export function BcryptGenerator({ title, description, features, useCases, faq }: BcryptGeneratorProps) {
    // Generate State
    const [input, setInput] = useState('');
    const [rounds, setRounds] = useState([10]);
    const [output, setOutput] = useState('');
    const [copied, setCopied] = useState(false);

    // Verify State
    const [verifyPass, setVerifyPass] = useState('');
    const [verifyHash, setVerifyHash] = useState('');
    const [verifyResult, setVerifyResult] = useState<'idle' | 'match' | 'no-match'>('idle');

    const handleGenerate = () => {
        if (!input) return;
        try {
            // Sync is fine for client interaction usually, but heavy rounds freeze UI.
            // Using async
            // bcryptjs is pure JS, so it might block main thread even if async?
            // Actually it uses setImmediate/nextTick to yield.
            bcrypt.hash(input, rounds[0], (err, hash) => {
                if (hash) setOutput(hash);
            });
        } catch (e) {
            console.error(e);
        }
    };

    const handleVerify = () => {
        if (!verifyPass || !verifyHash) return;
        bcrypt.compare(verifyPass, verifyHash, (err, res) => {
            setVerifyResult(res ? 'match' : 'no-match');
        });
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

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <ToolHeader title={title} description={description} />

            <main className="flex-1 mx-auto max-w-4xl px-4 py-8 sm:px-6 w-full space-y-8">

                {/* Generator Section */}
                <Card className="p-6 space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b">
                        <Key className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Generate Hash</h2>
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="input">Password</Label>
                        <Textarea
                            id="input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Enter password..."
                            className="min-h-[80px]"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <Label>Salt Rounds (Cost)</Label>
                            <span className="text-sm font-mono bg-muted px-2 py-0.5 rounded">{rounds[0]}</span>
                        </div>
                        <Slider
                            value={rounds}
                            onValueChange={setRounds}
                            min={4}
                            max={15}
                            step={1}
                            className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">Higher rounds = slower generation = more secure.</p>
                    </div>

                    <Button onClick={handleGenerate} className="w-full sm:w-auto">Generate Bcrypt Hash</Button>

                    <div className="space-y-2">
                        <Label>Bcrypt Hash Output</Label>
                        <div className="relative">
                            <div className="min-h-[60px] p-4 rounded-md bg-muted font-mono text-sm break-all flex items-center shadow-inner border">
                                {output || <span className="text-muted-foreground italic">Hash will appear here...</span>}
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="absolute right-2 top-1/2 -translate-y-1/2"
                                onClick={handleCopy}
                                disabled={!output}
                            >
                                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Verifier Section */}
                <Card className="p-6 space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Verify Hash</h2>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="v-pass">Password</Label>
                            <Textarea
                                id="v-pass"
                                value={verifyPass}
                                onChange={(e) => {
                                    setVerifyPass(e.target.value);
                                    if (verifyResult !== 'idle') setVerifyResult('idle');
                                }}
                                placeholder="Enter password to check..."
                                className="min-h-[80px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="v-hash">Hash</Label>
                            <Textarea
                                id="v-hash"
                                value={verifyHash}
                                onChange={(e) => {
                                    setVerifyHash(e.target.value);
                                    if (verifyResult !== 'idle') setVerifyResult('idle');
                                }}
                                placeholder="Enter bcrypt hash..."
                                className="min-h-[80px] font-mono text-sm"
                            />
                        </div>
                    </div>

                    <Button onClick={handleVerify} variant="secondary" className="w-full sm:w-auto">Verify Match</Button>

                    {verifyResult !== 'idle' && (
                        <div className={`p-4 rounded-lg flex items-center gap-3 border ${verifyResult === 'match'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-900'
                            } animate-in fade-in slide-in-from-top-2`}>
                            {verifyResult === 'match' ? (
                                <>
                                    <CheckCircle2 className="h-5 w-5" />
                                    <span className="font-medium">Password matches the hash!</span>
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-5 w-5" />
                                    <span className="font-medium">Password does NOT match the hash.</span>
                                </>
                            )}
                        </div>
                    )}
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
