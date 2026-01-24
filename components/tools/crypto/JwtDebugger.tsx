'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ToolHeader } from '../ToolHeader';
import { Label } from '@/components/ui/label';
import {
    Copy,
    Check,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Lightbulb,
    HelpCircle,
    FileJson,
    Clock
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import HmacSHA256 from 'crypto-js/hmac-sha256';
import encBase64 from 'crypto-js/enc-base64';
import encUtf8 from 'crypto-js/enc-utf8';

interface JwtDebuggerProps {
    title: string;
    description: string;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
}

export function JwtDebugger({ title, description, features, useCases, faq }: JwtDebuggerProps) {
    const [token, setToken] = useState('');
    const [header, setHeader] = useState('');
    const [payload, setPayload] = useState('');
    const [secret, setSecret] = useState('');
    const [signatureStatus, setSignatureStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
    const [error, setError] = useState<string | null>(null);
    const { theme } = useTheme();

    // Decode on input change
    useEffect(() => {
        if (!token) {
            setHeader('');
            setPayload('');
            setSignatureStatus('idle');
            setError(null);
            return;
        }

        try {
            const parts = token.split('.');
            if (parts.length !== 3) throw new Error('Invalid JWT format (must have 3 parts)');

            const decodePart = (part: string) => {
                // Fix base64url to base64
                const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
                // Decode
                try {
                    return JSON.stringify(JSON.parse(atob(base64)), null, 2);
                } catch (e) {
                    // If standard atob fails, try crypto-js
                    const words = encBase64.parse(base64);
                    const text = encUtf8.stringify(words);
                    return JSON.stringify(JSON.parse(text), null, 2);
                }
            };

            const h = decodePart(parts[0]);
            const p = decodePart(parts[1]);

            setHeader(h);
            setPayload(p);
            setError(null);

            // Check signature if secret is provided or just strictly formatting? 
            // We wait for verification usually, but auto-verify if secret exists?
            if (secret) verifySignature(token, secret);
            else setSignatureStatus('idle');

        } catch (err) {
            // console.error(err);
            // Don't clear fully, maybe typing
            // setError('Invalid JWT');
        }
    }, [token, secret]);

    const verifySignature = (jwt: string, key: string) => {
        try {
            const parts = jwt.split('.');
            if (parts.length !== 3) return;

            // Algorithm check (naive, assumes HS256 for this tool or detects)
            // Real JWT verification is complex. This is a "Debugger" primarily.
            // We'll support HS256 common case.

            const headerObj = JSON.parse(header || '{}');
            if (headerObj.alg !== 'HS256') {
                setSignatureStatus('idle');
                // Could warn: "Only HS256 supported for verification in this tool"
                return;
            }

            const data = parts[0] + '.' + parts[1];
            const signature = parts[2];

            const hash = HmacSHA256(data, key);
            const calculatedSig = encBase64.stringify(hash)
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, ''); // Base64URL

            if (calculatedSig === signature) {
                setSignatureStatus('valid');
            } else {
                setSignatureStatus('invalid');
            }
        } catch (e) {
            setSignatureStatus('invalid');
        }
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) setToken(text.trim());
        } catch (e) {
            console.error(e);
        }
    };

    const editorTheme = theme === 'dark' ? 'vs-dark' : 'light';

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <ToolHeader title={title} description={description} />

            <main className="flex-1 mx-auto max-w-6xl px-4 py-8 sm:px-6 w-full space-y-8">

                {/* Input Section */}
                <Card className="p-6 space-y-4 border-2 border-primary/20">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="token" className="text-base font-semibold">Encoded Token</Label>
                        <Button variant="outline" size="sm" onClick={handlePaste}>Paste Token</Button>
                    </div>
                    <Textarea
                        id="token"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="Paste your JWT here (eyJ...)"
                        className="font-mono text-xs min-h-[100px] break-all text-muted-foreground focus:text-foreground transition-colors"
                    />
                    {error && <p className="text-sm text-destructive">{error}</p>}
                </Card>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Header */}
                    <Card className="flex flex-col border overflow-hidden h-[400px]">
                        <div className="p-3 bg-muted/30 border-b flex items-center gap-2">
                            <FileJson className="h-4 w-4 text-red-500" />
                            <span className="font-semibold text-sm">Header</span>
                            <span className="text-xs text-muted-foreground ml-auto">Algorithm & Token Type</span>
                        </div>
                        <div className="flex-1">
                            <Editor
                                height="100%"
                                language="json"
                                value={header}
                                theme={editorTheme}
                                options={{ readOnly: true, minimap: { enabled: false }, fontSize: 13, lineNumbers: 'off' }}
                            />
                        </div>
                    </Card>

                    {/* Payload */}
                    <Card className="flex flex-col border overflow-hidden h-[400px]">
                        <div className="p-3 bg-muted/30 border-b flex items-center gap-2">
                            <FileJson className="h-4 w-4 text-purple-500" />
                            <span className="font-semibold text-sm">Payload</span>
                            <span className="text-xs text-muted-foreground ml-auto">Data Claims</span>
                        </div>
                        <div className="flex-1">
                            <Editor
                                height="100%"
                                language="json"
                                value={payload}
                                theme={editorTheme}
                                options={{ readOnly: true, minimap: { enabled: false }, fontSize: 13, lineNumbers: 'off' }}
                            />
                        </div>
                    </Card>
                </div>

                {/* Signature/Verify */}
                <Card className={`p-6 space-y-4 border-2 transition-colors ${signatureStatus === 'valid' ? 'border-green-500/50 bg-green-500/5' :
                        signatureStatus === 'invalid' ? 'border-red-500/50 bg-red-500/5' : 'border-border'
                    }`}>
                    <div className="flex items-center gap-2 pb-2 border-b">
                        <Shield className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-semibold">Verify Signature</h2>
                        {signatureStatus === 'valid' && (
                            <span className="ml-auto px-2 py-1 bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs rounded-full flex items-center gap-1 font-bold">
                                <Check className="h-3 w-3" /> Verified
                            </span>
                        )}
                        {signatureStatus === 'invalid' && (
                            <span className="ml-auto px-2 py-1 bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-100 text-xs rounded-full flex items-center gap-1 font-bold">
                                <ShieldAlert className="h-3 w-3" /> Invalid
                            </span>
                        )}
                    </div>

                    <div className="grid sm:grid-cols-[1fr_auto] gap-4 items-end">
                        <div className="space-y-2">
                            <Label htmlFor="secret">Your-256-bit-secret</Label>
                            <Input
                                id="secret"
                                type="text"
                                value={secret}
                                onChange={(e) => setSecret(e.target.value)}
                                placeholder="Enter secret to verify HS256 signature..."
                                className="font-mono bg-background"
                            />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Note: Only HS256 (HMAC with SHA-256) verification is supported in the browser client-side debugger currently.
                    </p>
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
