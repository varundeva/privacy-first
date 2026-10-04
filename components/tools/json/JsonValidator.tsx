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
    Wand2,
    Shrink,
    CheckCircle2,
    XCircle,
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

interface JsonValidatorProps {
    title: string;
    description: string;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
}

const SAMPLE_BROKEN_JSON = `{
  // Invalid JSON with comments, trailing comma, single quotes & Python literals
  'product_id': 101,
  'title': 'Wireless Noise-Canceling Headphones',
  'tags': ['audio', 'bluetooth', 'gadget',],
  'in_stock': True,
  'discount': None,
}`;

export function JsonValidator({ title, description, features, useCases, faq }: JsonValidatorProps) {
    const [input, setInput] = useState('');
    const [error, setError] = useState<{ message: string; line?: number; column?: number } | null>(null);
    const [isValid, setIsValid] = useState(false);
    const [copied, setCopied] = useState(false);
    const [fixedNotice, setFixedNotice] = useState<string | null>(null);

    const handleLoadSample = () => {
        setInput(SAMPLE_BROKEN_JSON);
        setFixedNotice(null);
    };
    const [isFullscreen, setIsFullscreen] = useState(false);
    const { theme } = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Escape listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFullscreen]);

    // Validation
    const validateJson = useCallback((content: string) => {
        if (!content.trim()) {
            setError(null);
            setIsValid(false);
            return;
        }

        try {
            JSON.parse(content);
            setError(null);
            setIsValid(true);
        } catch (err: any) {
            setIsValid(false);
            const msg = err.message || 'Syntax error in JSON';
            
            // Try to extract line and column from error message
            let line: number | undefined;
            let column: number | undefined;
            const posMatch = msg.match(/position\s+(\d+)/i);
            if (posMatch) {
                const pos = parseInt(posMatch[1], 10);
                const lines = content.slice(0, pos).split('\n');
                line = lines.length;
                column = lines[lines.length - 1].length + 1;
            }

            setError({ message: msg, line, column });
        }
    }, []);

    useEffect(() => {
        validateJson(input);
    }, [input, validateJson]);

    // Auto-fix common syntax mistakes
    const handleAutoFix = () => {
        let fixed = input;

        // 1. Remove single-line comments // ...
        fixed = fixed.replace(/\/\/.*$/gm, '');

        // 2. Remove multi-line comments /* ... */
        fixed = fixed.replace(/\/\*[\s\S]*?\*\//g, '');

        // 3. Replace Python literals True/False/None
        fixed = fixed.replace(/:\s*True\b/g, ': true');
        fixed = fixed.replace(/:\s*False\b/g, ': false');
        fixed = fixed.replace(/:\s*None\b/g, ': null');
        fixed = fixed.replace(/:\s*undefined\b/g, ': null');

        // 4. Convert single-quoted strings and keys to double quotes
        fixed = fixed.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '"$1"');

        // 5. Quote unquoted keys (e.g. { foo: "bar" } -> { "foo": "bar" })
        fixed = fixed.replace(/([{,]\s*)([a-zA-Z0-9_$-]+)\s*:/g, '$1"$2":');

        // 6. Remove trailing commas before } or ]
        fixed = fixed.replace(/,\s*([}\]])/g, '$1');

        try {
            const parsed = JSON.parse(fixed);
            const beautified = JSON.stringify(parsed, null, 2);
            setInput(beautified);
            setFixedNotice('Fixed trailing commas, single quotes, comments, and unquoted keys!');
            setTimeout(() => setFixedNotice(null), 4000);
        } catch (e: any) {
            // Apply partial fix anyway
            setInput(fixed);
            setFixedNotice('Applied partial fixes. Review remaining syntax issues below.');
            setTimeout(() => setFixedNotice(null), 4000);
        }
    };

    const handleBeautify = () => {
        try {
            const parsed = JSON.parse(input);
            setInput(JSON.stringify(parsed, null, 2));
        } catch (e) {
            // ignore
        }
    };

    const handleMinify = () => {
        try {
            const parsed = JSON.parse(input);
            setInput(JSON.stringify(parsed));
        } catch (e) {
            // ignore
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(input);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const handleDownload = () => {
        if (!input) return;
        const blob = new Blob([input], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = isValid ? 'valid.json' : 'data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setInput(content);
        };
        reader.readAsText(file);
    };

    const handleReset = () => {
        setInput('');
        setError(null);
        setIsValid(false);
    };

    // Calculate metadata
    const stats = useMemo(() => {
        const sizeBytes = new Blob([input]).size;
        const lines = input ? input.split('\n').length : 0;
        let keysCount = 0;
        let depth = 0;

        if (isValid) {
            try {
                const parsed = JSON.parse(input);
                const countKeys = (obj: any, currentDepth = 1): number => {
                    if (currentDepth > depth) depth = currentDepth;
                    if (typeof obj !== 'object' || obj === null) return 0;
                    let count = 0;
                    if (Array.isArray(obj)) {
                        obj.forEach(item => {
                            count += countKeys(item, currentDepth + 1);
                        });
                    } else {
                        const keys = Object.keys(obj);
                        count += keys.length;
                        keys.forEach(k => {
                            count += countKeys(obj[k], currentDepth + 1);
                        });
                    }
                    return count;
                };
                keysCount = countKeys(parsed);
            } catch (e) {
                // ignore
            }
        }

        return { sizeBytes, lines, keysCount, depth };
    }, [input, isValid]);

    const editorTheme = theme === 'dark' ? 'vs-dark' : 'light';

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <ToolHeader title={title} description={description} />

            <main className="flex-1 mx-auto px-4 py-8 sm:px-6 w-full max-w-[96%] xl:max-w-[94%] 2xl:max-w-[1700px] space-y-8">
                {/* Workspace Container */}
                <div className={isFullscreen ? 'fixed inset-0 z-50 bg-background flex flex-col p-4 sm:p-6 overflow-hidden space-y-4' : 'space-y-6'}>
                    {/* Status & Options Toolbar */}
                    <Card className="p-4 sm:p-5 shadow-xs border-2 border-border/80">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                            {/* Status indicator */}
                            <div className="flex items-center gap-3">
                                {isValid ? (
                                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span className="text-xs font-semibold uppercase tracking-wider">Valid JSON</span>
                                    </div>
                                ) : error ? (
                                    <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800">
                                        <XCircle className="h-4 w-4" />
                                        <span className="text-xs font-semibold uppercase tracking-wider">
                                            Invalid JSON {error.line && `(Line ${error.line}, Col ${error.column})`}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg font-medium">
                                        Paste or upload JSON to validate
                                    </div>
                                )}

                                {/* Metrics */}
                                {isValid && (
                                    <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-muted-foreground border-l pl-4">
                                        <span><strong>{stats.keysCount}</strong> keys</span>
                                        <span><strong>{stats.depth}</strong> levels deep</span>
                                        <span><strong>{(stats.sizeBytes / 1024).toFixed(1)}</strong> KB</span>
                                    </div>
                                )}
                            </div>

                            {/* Actions toolbar */}
                            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                                <Button
                                    onClick={handleLoadSample}
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5 h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
                                    title="Load sample invalid JSON with common syntax errors"
                                >
                                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                                    <span>Load Sample</span>
                                </Button>

                                <Button
                                    onClick={handleAutoFix}
                                    variant="default"
                                    size="sm"
                                    className="gap-1.5 h-8 text-xs font-medium bg-amber-600 hover:bg-amber-700 text-white"
                                    title="Auto-fix trailing commas, single quotes & Python literals"
                                >
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Auto-Fix JSON
                                </Button>

                                <Button
                                    onClick={handleBeautify}
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5 h-8 text-xs font-medium"
                                    title="Format & Beautify JSON"
                                    disabled={!isValid}
                                >
                                    <Wand2 className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Beautify</span>
                                </Button>

                                <Button
                                    onClick={handleMinify}
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5 h-8 text-xs font-medium"
                                    title="Minify JSON (Compact)"
                                    disabled={!isValid}
                                >
                                    <Shrink className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Minify</span>
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

                        {/* Auto-fix notice pill */}
                        {fixedNotice && (
                            <div className="mt-3 p-2 rounded bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs font-medium border border-amber-200 dark:border-amber-800 animate-in fade-in">
                                ✨ {fixedNotice}
                            </div>
                        )}
                    </Card>

                    {/* Editor Card */}
                    <Card className={`flex flex-col border-2 overflow-hidden shadow-xs ${isFullscreen ? 'flex-1 min-h-0' : 'h-[650px]'} ${error ? 'border-rose-300 dark:border-rose-900' : 'border-border'}`}>
                        <div className="p-3 bg-muted/30 border-b flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileJson className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">JSON Document ({stats.lines} lines)</span>
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
                                    onClick={handleCopy}
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                                    title="Copy to Clipboard"
                                    disabled={!input}
                                >
                                    {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                    <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                                </Button>
                                <Button
                                    onClick={handleDownload}
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                    title="Download JSON"
                                    disabled={!input}
                                >
                                    <Download className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    onClick={handleReset}
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    title="Clear"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 relative">
                            <Editor
                                height="100%"
                                language="json"
                                value={input}
                                theme={editorTheme}
                                onChange={(v) => setInput(v || '')}
                                options={{
                                    minimap: { enabled: true },
                                    fontSize: 13,
                                    lineNumbers: 'on',
                                    folding: true,
                                    automaticLayout: true,
                                    scrollBeyondLastLine: false,
                                }}
                            />

                            {/* Error Banner overlay */}
                            {error && (
                                <div className="absolute bottom-4 left-4 right-4 bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 p-3 rounded-lg text-xs font-mono border border-rose-300 dark:border-rose-800 shadow-md z-10 flex items-start gap-2.5 animate-in slide-in-from-bottom-2">
                                    <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                                    <div className="space-y-0.5">
                                        <div className="font-bold">Syntax Error {error.line && `at line ${error.line}, column ${error.column}`}:</div>
                                        <div className="break-all">{error.message}</div>
                                    </div>
                                    <Button
                                        onClick={handleAutoFix}
                                        size="sm"
                                        className="ml-auto flex-shrink-0 h-6 text-[11px] bg-rose-600 hover:bg-rose-700 text-white"
                                    >
                                        Auto-Fix
                                    </Button>
                                </div>
                            )}
                        </div>
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
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                            <Lightbulb className="h-5 w-5" />
                                        </div>
                                        <h2 className="text-xl font-semibold">Common Use Cases</h2>
                                    </div>
                                    <Card className="p-6">
                                        <ul className="space-y-3">
                                            {useCases.map((useCase, index) => (
                                                <li key={index} className="flex items-start gap-3 text-muted-foreground">
                                                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
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
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                        <HelpCircle className="h-5 w-5" />
                                    </div>
                                    <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                                </div>
                                <Card className="p-6">
                                    <Accordion type="single" collapsible className="w-full">
                                        {faq.map((item, index) => (
                                            <AccordionItem key={index} value={`item-${index}`}>
                                                <AccordionTrigger className="text-left font-medium">
                                                    {item.question}
                                                </AccordionTrigger>
                                                <AccordionContent className="text-muted-foreground leading-relaxed">
                                                    {item.answer}
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </Card>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
