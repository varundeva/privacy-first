'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ToolHeader } from '../ToolHeader';
import {
    Copy,
    Check,
    AlertCircle,
    FileJson,
    ArrowRightLeft,
    Download,
    Lightbulb,
    HelpCircle,
    Trash2,
    Settings2,
    Upload,
    FileCode,
    Maximize2,
    Minimize2,
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import Editor, { OnValidate } from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import yaml from 'js-yaml';

interface YamlToJsonProps {
    title: string;
    description: string;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
}

export function YamlToJson({ title, description, features, useCases, faq }: YamlToJsonProps) {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
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

    const handleConvert = () => {
        if (!input.trim()) {
            setError(null);
            setStatus('idle');
            return;
        }

        try {
            const parsed = yaml.load(input);
            if (!parsed) {
                throw new Error('Invalid YAML');
            }
            const res = JSON.stringify(parsed, null, 2);
            setOutput(res);
            setError(null);
            setStatus('valid');
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Invalid YAML');
            }
            setStatus('invalid');
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(output);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const handleDownload = () => {
        if (!output) return;
        const blob = new Blob([output], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'converted.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleReset = () => {
        setInput('');
        setOutput('');
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
                if (status === 'invalid') {
                    setStatus('idle');
                    setError(null);
                }
            }
        };
        reader.readAsText(file);
    };

    const handleEditorChange = (value: string | undefined) => {
        setInput(value || '');
        if (status === 'invalid' && !value) {
            setStatus('idle');
            setError(null);
        }
    };

    const handleValidate: OnValidate = useCallback((markers) => {
        // Validation for YAML isn't strictly supported by 'onValidate' in Monaco 'yaml' language out of box perfectly without schema
        // But syntax errors usually show up.
        // We rely on handleConvert for strict validation feedback.
    }, []);

    const editorTheme = theme === 'dark' ? 'vs-dark' : 'light';

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <ToolHeader title={title} description={description} />

            <main className="flex-1 mx-auto px-4 py-8 sm:px-6 w-full max-w-[96%] xl:max-w-[94%] 2xl:max-w-[1700px] space-y-8">
                {/* Workspace Container */}
                <div className={isFullscreen ? 'fixed inset-0 z-50 bg-background flex flex-col p-4 sm:p-6 overflow-hidden space-y-4' : 'space-y-6'}>
                    {/* Top Toolbar */}
                    <div className="flex flex-wrap gap-4 sm:gap-6 p-4 border rounded-xl bg-card items-center shadow-xs">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                <FileCode className="h-4 w-4" />
                            </div>
                            <span className="font-semibold text-sm">YAML to JSON Converter</span>
                        </div>

                        <div className="flex items-center gap-2 ml-auto">
                            <Button
                                onClick={handleConvert}
                                size="sm"
                                className="gap-1.5 h-8 text-xs font-medium"
                            >
                                <ArrowRightLeft className="h-3.5 w-3.5" />
                                Convert to JSON
                            </Button>

                            <Button
                                variant={isFullscreen ? "default" : "outline"}
                                size="sm"
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                className="gap-1.5 h-8 text-xs font-medium"
                                title={isFullscreen ? "Exit Fullscreen (Esc)" : "Expand Fullscreen"}
                            >
                                {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                                <span className="hidden sm:inline">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
                                {isFullscreen && <kbd className="hidden sm:inline-block px-1 py-0.2 bg-primary-foreground/20 rounded text-[10px] ml-1">ESC</kbd>}
                            </Button>
                        </div>
                    </div>

                    {/* Editors Layout */}
                    <div className={`grid lg:grid-cols-2 gap-4 sm:gap-6 ${isFullscreen ? 'flex-1 min-h-0' : 'h-[600px]'}`}>
                        {/* YAML Input */}
                        <Card className={`flex flex-col border-2 overflow-hidden h-full shadow-xs ${status === 'invalid' ? 'border-red-200 dark:border-red-900' : 'border-border'
                            }`}>
                            <div className="p-3 bg-muted/30 border-b flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileCode className="h-4 w-4 text-amber-500" />
                                    <span className="text-sm font-medium">YAML Input</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={() => fileInputRef.current?.click()}
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                        title="Upload YAML"
                                    >
                                        <Upload className="h-3.5 w-3.5" />
                                    </Button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept=".yaml,.yml,.txt"
                                        onChange={handleFileUpload}
                                    />
                                </div>
                            </div>
                            <div className="flex-1 relative">
                                <Editor
                                    height="100%"
                                    language="yaml"
                                    value={input}
                                    theme={editorTheme}
                                    onChange={handleEditorChange}
                                    onValidate={handleValidate}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 13,
                                        lineNumbers: 'on',
                                        folding: true,
                                        automaticLayout: true,
                                        scrollBeyondLastLine: false,
                                    }}
                                />
                                {error && (
                                    <div className="absolute bottom-4 left-4 right-4 bg-red-100 dark:bg-red-900/90 text-red-700 dark:text-red-200 p-2 rounded text-xs font-mono border border-red-200 dark:border-red-800 shadow-sm z-10 transition-all animate-in slide-in-from-bottom-2">
                                        {error}
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* JSON Output */}
                        <Card className="flex flex-col border-2 border-border overflow-hidden h-full shadow-xs">
                            <div className="p-3 bg-muted/30 border-b flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileJson className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-medium">JSON Output</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button onClick={handleCopy} variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" title="Copy JSON">
                                        <Copy className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button onClick={handleDownload} variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" title="Download JSON">
                                        <Download className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex-1">
                                <Editor
                                    height="100%"
                                    language="json"
                                    value={output}
                                    theme={editorTheme}
                                    options={{
                                        readOnly: true,
                                        minimap: { enabled: false },
                                        fontSize: 13,
                                        lineNumbers: 'on',
                                        folding: true,
                                        automaticLayout: true,
                                        scrollBeyondLastLine: false,
                                    }}
                                />
                            </div>
                        </Card>
                    </div>

                    {/* Actions below editors in normal mode */}
                    {!isFullscreen && (
                        <div className="flex justify-center gap-4">
                            <Button onClick={handleReset} variant="outline" size="lg" className="gap-2 px-8 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50">
                                <Trash2 className="h-5 w-5" />
                                Reset
                            </Button>
                            <Button onClick={handleConvert} size="lg" className="gap-2 px-8">
                                <ArrowRightLeft className="h-5 w-5" />
                                Convert to JSON
                            </Button>
                        </div>
                    )}
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
