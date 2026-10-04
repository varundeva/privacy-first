'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ToolHeader } from '../ToolHeader';
import {
    Copy,
    Check,
    AlertCircle,
    FileJson,
    Download,
    Lightbulb,
    HelpCircle,
    Trash2,
    Upload,
    Maximize2,
    Minimize2,
    Shrink,
    Wand2,
    Zap,
    Percent,
    ArrowRight,
    CheckCircle2,
    FileCode,
    Sliders,
    Sparkles
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';

interface JsonMinifierProps {
    title: string;
    description: string;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
}

const SAMPLE_EXPANDED_JSON = `{
  "application": "Cloud Analytics Engine",
  "version": "4.2.0",
  "environment": "production",
  "cluster": {
    "datacenter": "us-east-virginia",
    "nodes": [
      {
        "id": "node-alpha-1",
        "ip": "10.0.1.15",
        "role": "coordinator",
        "healthy": true,
        "loadAverage": 0.42
      },
      {
        "id": "node-alpha-2",
        "ip": "10.0.1.16",
        "role": "worker",
        "healthy": true,
        "loadAverage": 0.78
      }
    ],
    "maxReplicas": 10,
    "autoScaling": true
  },
  "metrics": {
    "requestsPerSecond": 14200,
    "p99LatencyMs": 14.2,
    "errorRatePercent": 0.001
  }
}`;

export function JsonMinifier({ title, description, features, useCases, faq }: JsonMinifierProps) {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleLoadSample = () => {
        setInput(SAMPLE_EXPANDED_JSON);
    };
    const [copied, setCopied] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [escapeUnicode, setEscapeUnicode] = useState(false);
    const [outputNdjson, setOutputNdjson] = useState(false);
    const { theme } = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Escape listener for fullscreen
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFullscreen]);

    // Core Minification Logic
    const handleMinify = useCallback(() => {
        if (!input.trim()) {
            setOutput('');
            setError(null);
            return;
        }

        try {
            // Clean common comments & trailing commas first
            let sanitized = input
                .replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '$1')
                .replace(/,\s*([\]}])/g, '$1');

            const parsed = JSON.parse(sanitized);

            if (outputNdjson && Array.isArray(parsed)) {
                // Convert array to NDJSON (one line per element)
                const ndjsonLines = parsed.map(item => JSON.stringify(item));
                setOutput(ndjsonLines.join('\n'));
            } else {
                let minified = JSON.stringify(parsed);
                if (escapeUnicode) {
                    minified = minified.replace(/[\u007F-\uFFFF]/g, (chr) => {
                        return '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).substr(-4);
                    });
                }
                setOutput(minified);
            }

            setError(null);
        } catch (err: any) {
            setError(err.message || 'Invalid JSON syntax. Please check for missing quotes or brackets.');
        }
    }, [input, escapeUnicode, outputNdjson]);

    // Auto minify on input or options change
    useEffect(() => {
        handleMinify();
    }, [handleMinify]);

    // Quick Beautify source
    const handleBeautifySource = () => {
        try {
            const parsed = JSON.parse(input);
            setInput(JSON.stringify(parsed, null, 2));
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Cannot beautify invalid JSON');
        }
    };

    // Calculate Byte stats
    const stats = useMemo(() => {
        const originalBytes = new Blob([input]).size;
        const minifiedBytes = output ? new Blob([output]).size : 0;
        const savedBytes = Math.max(0, originalBytes - minifiedBytes);
        const percentSaved = originalBytes > 0 && output ? ((savedBytes / originalBytes) * 100).toFixed(1) : '0';

        return {
            originalBytes,
            minifiedBytes,
            savedBytes,
            percentSaved
        };
    }, [input, output]);

    const handleCopy = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!output) return;
        const blob = new Blob([output], { type: outputNdjson ? 'application/x-ndjson' : 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = outputNdjson ? 'compressed.ndjson' : 'minified.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setInput(event.target.result as string);
                }
            };
            reader.readAsText(file);
        }
    };

    const editorTheme = theme === 'dark' ? 'vs-dark' : 'light';

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <ToolHeader title={title} description={description} />

            <main className="flex-1 mx-auto px-4 py-8 sm:px-6 w-full max-w-[96%] xl:max-w-[94%] 2xl:max-w-[1700px] space-y-8">
                {/* Workspace Container */}
                <div className={isFullscreen ? 'fixed inset-0 z-50 bg-background flex flex-col p-4 sm:p-6 overflow-hidden space-y-4' : 'space-y-6'}>
                    {/* Top Stats & Options Toolbar */}
                    <Card className="p-4 sm:p-5 shadow-xs border-2 border-border/80">
                        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                            {/* Compression Stats Badge */}
                            <div className="flex items-center flex-wrap gap-3">
                                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
                                    <Zap className="h-4 w-4 text-emerald-500" />
                                    <span>Saved {stats.percentSaved}% ({stats.savedBytes} bytes)</span>
                                </div>

                                <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-muted-foreground border-l pl-3">
                                    <span>Original: <strong>{(stats.originalBytes / 1024).toFixed(2)} KB</strong></span>
                                    <ArrowRight className="h-3 w-3 text-muted-foreground/60" />
                                    <span className="text-emerald-600 dark:text-emerald-400">Minified: <strong>{(stats.minifiedBytes / 1024).toFixed(2)} KB</strong></span>
                                </div>
                            </div>

                            {/* Options & Action Buttons */}
                            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
                                {/* Unicode Escaping Option */}
                                <Button
                                    variant={escapeUnicode ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setEscapeUnicode(!escapeUnicode)}
                                    className="h-8 text-xs font-medium border"
                                    title="Escape non-ASCII unicode characters to \uXXXX"
                                >
                                    \u Unicode
                                </Button>

                                {/* NDJSON Option */}
                                <Button
                                    variant={outputNdjson ? "secondary" : "ghost"}
                                    size="sm"
                                    onClick={() => setOutputNdjson(!outputNdjson)}
                                    className="h-8 text-xs font-medium border"
                                    title="Format arrays as Newline Delimited JSON (NDJSON)"
                                >
                                    NDJSON Mode
                                </Button>

                                <Button
                                    onClick={handleLoadSample}
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5 h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
                                    title="Load sample expanded JSON"
                                >
                                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                                    <span>Load Sample</span>
                                </Button>

                                <Button
                                    onClick={handleBeautifySource}
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5 h-8 text-xs font-medium"
                                    title="Format & Beautify Source JSON"
                                >
                                    <Wand2 className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Beautify Input</span>
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
                    </Card>

                    {/* Editor Panels */}
                    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${isFullscreen ? 'flex-1 min-h-0' : 'h-[640px]'}`}>
                        {/* Source Editor */}
                        <Card className={`flex flex-col border-2 overflow-hidden shadow-xs ${error ? 'border-rose-300 dark:border-rose-900' : 'border-border'}`}>
                            <div className="p-3 bg-muted/40 border-b flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileJson className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-medium">Source JSON</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Button
                                        onClick={() => fileInputRef.current?.click()}
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                        title="Upload JSON File"
                                    >
                                        <Upload className="h-3.5 w-3.5" />
                                    </Button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept=".json,.txt"
                                        onChange={handleFileUpload}
                                    />
                                    <Button
                                        onClick={() => setInput('')}
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                        title="Clear Input"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex-1 min-h-0">
                                <Editor
                                    height="100%"
                                    language="json"
                                    theme={editorTheme}
                                    value={input}
                                    onChange={(val) => setInput(val || '')}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 13,
                                        tabSize: 2,
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        wordWrap: 'on'
                                    }}
                                />
                            </div>

                            {error && (
                                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border-t border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <span className="truncate font-mono">{error}</span>
                                </div>
                            )}
                        </Card>

                        {/* Minified Output Editor */}
                        <Card className="flex flex-col border-2 border-border overflow-hidden shadow-xs">
                            <div className="p-3 bg-muted/40 border-b flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Shrink className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-sm font-medium">Minified JSON Output</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Button
                                        onClick={handleCopy}
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                                        title="Copy Minified JSON"
                                        disabled={!output}
                                    >
                                        {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                        <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                                    </Button>
                                    <Button
                                        onClick={handleDownload}
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                        title="Download Minified File"
                                        disabled={!output}
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex-1 min-h-0">
                                <Editor
                                    height="100%"
                                    language="json"
                                    theme={editorTheme}
                                    value={output}
                                    options={{
                                        readOnly: true,
                                        minimap: { enabled: false },
                                        fontSize: 13,
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        wordWrap: 'on'
                                    }}
                                />
                            </div>
                        </Card>
                    </div>
                </div>

                {/* SEO Content Section */}
                <div className="space-y-6 pt-6 border-t">
                    {/* Features and Use Cases Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {features && features.length > 0 && (
                            <Card className="p-6">
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Lightbulb className="h-5 w-5 text-primary" />
                                    Key Features
                                </h2>
                                <ul className="space-y-2.5">
                                    {features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                                            <span className="text-primary font-bold mt-0.5">•</span>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        )}

                        {useCases && useCases.length > 0 && (
                            <Card className="p-6">
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <HelpCircle className="h-5 w-5 text-primary" />
                                    Common Use Cases
                                </h2>
                                <ul className="space-y-2.5">
                                    {useCases.map((useCase, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                                            <span className="text-primary font-bold mt-0.5">•</span>
                                            <span>{useCase}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        )}
                    </div>

                    {/* FAQ Accordion */}
                    {faq && faq.length > 0 && (
                        <Card className="p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <HelpCircle className="h-5 w-5 text-primary" />
                                Frequently Asked Questions
                            </h2>
                            <Accordion type="single" collapsible className="w-full">
                                {faq.map((item, index) => (
                                    <AccordionItem key={index} value={`item-${index}`}>
                                        <AccordionTrigger className="text-sm font-medium text-left">
                                            {item.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-sm text-muted-foreground">
                                            {item.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
}
