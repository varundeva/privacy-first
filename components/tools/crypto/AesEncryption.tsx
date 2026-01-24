'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ToolHeader } from '../ToolHeader';
import { Label } from '@/components/ui/label';
import {
    Copy,
    Check,
    Lock,
    Unlock,
    Key,
    Shield,
    Lightbulb,
    HelpCircle,
    ArrowRightLeft,
    RefreshCw
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AES from 'crypto-js/aes';
import encUtf8 from 'crypto-js/enc-utf8';

interface AesEncryptionProps {
    title: string;
    description: string;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
}

export function AesEncryption({ title, description, features, useCases, faq }: AesEncryptionProps) {
    const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
    const [input, setInput] = useState('');
    const [secret, setSecret] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const process = () => {
        if (!input || !secret) {
            setError('Please provide both input text and a secret key.');
            return;
        }
        setError(null);
        setOutput('');

        try {
            if (mode === 'encrypt') {
                const ciphertext = AES.encrypt(input, secret).toString();
                setOutput(ciphertext);
            } else {
                const bytes = AES.decrypt(input, secret);
                const originalText = bytes.toString(encUtf8);
                if (!originalText) throw new Error('Malformed or invalid key');
                setOutput(originalText);
            }
        } catch (err) {
            console.error(err);
            setError(mode === 'decrypt' ? 'Decryption failed. Check your key and input.' : 'Encryption failed.');
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

    const handleSwap = () => {
        if (output && !error) {
            setInput(output);
            setOutput('');
            setMode(mode === 'encrypt' ? 'decrypt' : 'encrypt');
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <ToolHeader title={title} description={description} />

            <main className="flex-1 mx-auto max-w-4xl px-4 py-8 sm:px-6 w-full space-y-8">

                <Card className="p-6 space-y-6">
                    <Tabs value={mode} onValueChange={(v) => {
                        setMode(v as 'encrypt' | 'decrypt');
                        setError(null);
                        setOutput('');
                    }} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="encrypt" className="gap-2">
                                <Lock className="h-4 w-4" />
                                Encrypt
                            </TabsTrigger>
                            <TabsTrigger value="decrypt" className="gap-2">
                                <Unlock className="h-4 w-4" />
                                Decrypt
                            </TabsTrigger>
                        </TabsList>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="input">{mode === 'encrypt' ? 'Plaintext' : 'Ciphertext (Base64)'}</Label>
                                <Textarea
                                    id="input"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={mode === 'encrypt' ? 'Enter text to encrypt...' : 'Enter AES encrypted string...'}
                                    className="min-h-[120px] font-mono"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="secret" className="flex items-center gap-2">
                                    <Key className="h-4 w-4" />
                                    Secret Key
                                </Label>
                                <Input
                                    id="secret"
                                    type="password"
                                    value={secret}
                                    onChange={(e) => setSecret(e.target.value)}
                                    placeholder="Enter a strong secret key..."
                                    autoComplete="off"
                                />
                            </div>

                            <div className="flex gap-4">
                                <Button onClick={process} className="flex-1 gap-2">
                                    {mode === 'encrypt' ? <Shield className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                                    {mode === 'encrypt' ? 'Encrypt Text' : 'Decrypt Text'}
                                </Button>
                                {output && !error && (
                                    <Button onClick={handleSwap} variant="outline" title="Use Output as Input">
                                        <ArrowRightLeft className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            {error && (
                                <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/10 p-3 rounded border border-red-200 dark:border-red-900">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2 pt-4 border-t">
                                <Label htmlFor="output">{mode === 'encrypt' ? 'Ciphertext Output' : 'Decrypted Plaintext'}</Label>
                                <div className="relative">
                                    <div className={`min-h-[80px] p-4 rounded-md bg-muted font-mono text-sm break-all flex items-center shadow-inner border ${output ? 'text-foreground' : 'text-muted-foreground italic'}`}>
                                        {output || 'Result will appear here...'}
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="absolute right-2 top-2 hover:bg-background/80"
                                        onClick={handleCopy}
                                        disabled={!output}
                                        title="Copy Result"
                                    >
                                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    </Button>
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
