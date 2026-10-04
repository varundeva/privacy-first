'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ToolHeader } from '../ToolHeader';
import {
    Copy,
    Check,
    AlertCircle,
    Shrink,
    Wand2,
    Maximize2,
    Minimize2,
    Trash2,
    Lightbulb,
    HelpCircle,
    Upload
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import Editor, { OnValidate } from '@monaco-editor/react';
import { useTheme } from 'next-themes';

interface JsonFormatterProps {
    title: string;
    description: string;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
}

export function JsonFormatter({ title, description, features, useCases, faq }: JsonFormatterProps) {
    const [input, setInput] = useState('');
    const [indentation, setIndentation] = useState('2');
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const { theme } = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Listen for Escape key to exit fullscreen
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFullscreen]);

    const handleFormat = () => {
        if (!input.trim()) {
            setError(null);
            setStatus('idle');
            return;
        }

        try {
            const parsed = JSON.parse(input);
            const spaces = indentation === 'tab' ? '\t' : parseInt(indentation);
            setInput(JSON.stringify(parsed, null, spaces));
            setError(null);
            setStatus('valid');
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Invalid JSON');
            }
            setStatus('invalid');
        }
    };

    const handleMinify = () => {
        if (!input.trim()) return;
        try {
            const parsed = JSON.parse(input);
            setInput(JSON.stringify(parsed));
            setError(null);
            setStatus('valid');
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            }
            setStatus('invalid');
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(input);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const handleClear = () => {
        setInput('');
        setError(null);
        setStatus('idle');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (text) {
                setInput(text);
                if (status !== 'idle') setStatus('idle');
                setError(null);
            }
        };
        reader.readAsText(file);
    };

    const handleEditorChange = (value: string | undefined) => {
        setInput(value || '');
        if (status !== 'idle' && status !== 'invalid') setStatus('idle');
        if (status === 'invalid' && !value) {
            setStatus('idle');
            setError(null);
        }
    };

    const handleValidate: OnValidate = useCallback((markers) => {
        const errors = markers.filter(m => m.severity === 8);
        if (errors.length > 0) {
            setError(errors[0].message + ` (Line ${errors[0].startLineNumber})`);
            setStatus('invalid');
        } else {
            if (input.trim().length > 0) {
                setError(null);
                setStatus('valid');
            }
        }
    }, [input]);

    const editorTheme = theme === 'dark' ? 'vs-dark' : 'light';

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <ToolHeader title={title} description={description} />

            <main className="flex-1 mx-auto px-4 py-8 sm:px-6 w-full max-w-[96%] xl:max-w-[94%] 2xl:max-w-[1700px] space-y-8">
                {/* Editor Workspace Container */}
                <div className={isFullscreen ? 'fixed inset-0 z-50 bg-background flex flex-col p-4 sm:p-6 overflow-hidden space-y-4' : 'space-y-4'}>
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 bg-muted/40 p-3 rounded-xl border border-border/60">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Button
                                onClick={() => fileInputRef.current?.click()}
                                variant="secondary"
                                size="sm"
                                className="gap-2 h-9 text-xs"
                            >
                                <Upload className="h-3.5 w-3.5" />
                                <span>Load File</span>
                            </Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".json,.txt"
                                onChange={handleFileUpload}
                            />

                            <Select value={indentation} onValueChange={setIndentation}>
                                <SelectTrigger className="w-[130px] h-9 text-xs">
                                    <SelectValue placeholder="Indentation" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2">2 Spaces</SelectItem>
                                    <SelectItem value="4">4 Spaces</SelectItem>
                                    <SelectItem value="tab">Tab</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button onClick={handleFormat} variant="default" size="sm" className="gap-2 h-9 text-xs font-medium">
                                <Wand2 className="h-3.5 w-3.5" />
                                <span>Beautify</span>
                            </Button>
                            <Button onClick={handleMinify} variant="outline" size="sm" className="gap-2 h-9 text-xs">
                                <Shrink className="h-3.5 w-3.5" />
                                <span>Minify</span>
                            </Button>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${status === 'valid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                status === 'invalid' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                    'bg-muted text-muted-foreground'
                                }`}>
                                {status === 'valid' && <Check className="h-3.5 w-3.5" />}
                                {status === 'invalid' && <AlertCircle className="h-3.5 w-3.5" />}
                                <span>{status === 'idle' ? 'Ready' : status === 'valid' ? 'Valid JSON' : 'Invalid JSON'}</span>
                            </div>

                            <Button onClick={handleCopy} variant="ghost" size="icon" className="h-8 w-8" title="Copy formatted JSON">
                                <Copy className="h-4 w-4" />
                            </Button>
                            <Button onClick={handleClear} variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" title="Clear input">
                                <Trash2 className="h-4 w-4" />
                            </Button>

                            {/* Fullscreen Toggle */}
                            <Button
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                variant={isFullscreen ? 'default' : 'outline'}
                                size="sm"
                                className="gap-1.5 text-xs h-9 font-medium"
                                title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Expand to Fullscreen workspace'}
                            >
                                {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                                <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
                                {isFullscreen && (
                                    <kbd className="hidden sm:inline-block px-1 py-0.2 rounded bg-primary-foreground/20 text-[10px]">
                                        ESC
                                    </kbd>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Editor Area */}
                    <Card className={`relative flex-1 ${isFullscreen ? 'min-h-0' : 'min-h-[600px]'} flex flex-col border-2 overflow-hidden transition-colors ${status === 'invalid' ? 'border-red-200 dark:border-red-900' :
                        status === 'valid' ? 'border-green-200 dark:border-green-900' : 'border-border'
                        }`}>
                        <Editor
                            height={isFullscreen ? 'calc(100vh - 160px)' : '600px'}
                            language="json"
                            value={input}
                            theme={editorTheme}
                            onChange={handleEditorChange}
                            onValidate={handleValidate}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                lineNumbers: 'on',
                                folding: true,
                                automaticLayout: true,
                                formatOnPaste: true,
                                formatOnType: true,
                                scrollBeyondLastLine: false,
                            }}
                        />

                        {error && (
                            <div className="absolute bottom-4 left-4 right-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 p-3 rounded-lg text-sm font-mono border border-red-200 dark:border-red-800 flex items-start gap-2 shadow-lg animate-in slide-in-from-bottom-2 z-10">
                                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <span className="whitespace-pre-wrap">{error}</span>
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
            </main>
        </div>
    );
}
