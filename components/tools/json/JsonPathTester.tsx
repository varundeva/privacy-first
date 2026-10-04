'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    Search,
    Wand2,
    BookOpen,
    Play,
    Sparkles
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import Editor, { OnValidate } from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { JSONPath } from 'jsonpath-plus';

interface JsonPathTesterProps {
    title: string;
    description: string;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
}

const SAMPLE_JSON = `{
  "store": {
    "book": [
      {
        "category": "reference",
        "author": "Nigel Rees",
        "title": "Sayings of the Century",
        "price": 8.95
      },
      {
        "category": "fiction",
        "author": "Evelyn Waugh",
        "title": "Sword of Honour",
        "price": 12.99
      },
      {
        "category": "fiction",
        "author": "Herman Melville",
        "title": "Moby Dick",
        "isbn": "0-553-21311-3",
        "price": 8.99
      },
      {
        "category": "fiction",
        "author": "J. R. R. Tolkien",
        "title": "The Lord of the Rings",
        "isbn": "0-395-19395-8",
        "price": 22.99
      }
    ],
    "bicycle": {
      "color": "red",
      "price": 19.95
    }
  }
}`;

const CHEATSHEET = [
    { label: 'All book titles', path: '$.store.book[*].title' },
    { label: 'All authors', path: '$..author' },
    { label: 'Books under $10', path: '$.store.book[?(@.price < 10)]' },
    { label: 'Last book', path: '$.store.book[-1:]' },
    { label: 'All items in store', path: '$.store.*' },
    { label: 'All prices in doc', path: '$..price' },
];

export function JsonPathTester({ title, description, features, useCases, faq }: JsonPathTesterProps) {
    const [input, setInput] = useState('');
    const [path, setPath] = useState('');
    const [output, setOutput] = useState('');
    const [matchCount, setMatchCount] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);

    const handleLoadSample = () => {
        setInput(SAMPLE_JSON);
        setPath('$.store.book[*].title');
    };
    const [jsonError, setJsonError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const { theme } = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Escape key listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFullscreen]);

    // Evaluation logic
    const evaluatePath = useCallback((jsonStr: string, jsonPathStr: string) => {
        if (!jsonStr.trim()) {
            setOutput('');
            setMatchCount(0);
            setError(null);
            return;
        }

        try {
            const parsed = JSON.parse(jsonStr);
            setJsonError(null);

            if (!jsonPathStr.trim()) {
                setOutput(JSON.stringify(parsed, null, 2));
                setMatchCount(1);
                setError(null);
                return;
            }

            try {
                const result = JSONPath({
                    path: jsonPathStr.trim(),
                    json: parsed,
                });

                setMatchCount(Array.isArray(result) ? result.length : 1);
                setOutput(JSON.stringify(result, null, 2));
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Invalid JSONPath expression');
                setOutput('');
                setMatchCount(0);
            }
        } catch (err: any) {
            setJsonError(err.message || 'Invalid JSON format');
            setOutput('');
            setMatchCount(0);
        }
    }, []);

    // Re-evaluate on input or path change
    useEffect(() => {
        evaluatePath(input, path);
    }, [input, path, evaluatePath]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
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
        a.download = 'jsonpath-result.json';
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

    const handleBeautify = () => {
        try {
            const parsed = JSON.parse(input);
            setInput(JSON.stringify(parsed, null, 2));
        } catch (e) {
            // ignore
        }
    };

    const handleReset = () => {
        setInput('');
        setPath('$');
        setOutput('');
        setError(null);
        setJsonError(null);
        setMatchCount(0);
    };

    const editorTheme = theme === 'dark' ? 'vs-dark' : 'light';

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <ToolHeader title={title} description={description} />

            <main className="flex-1 mx-auto px-4 py-8 sm:px-6 w-full max-w-[96%] xl:max-w-[94%] 2xl:max-w-[1700px] space-y-8">
                {/* Workspace Container */}
                <div className={isFullscreen ? 'fixed inset-0 z-50 bg-background flex flex-col p-4 sm:p-6 overflow-hidden space-y-4' : 'space-y-6'}>
                    {/* JSONPath Query Bar Card */}
                    <Card className="p-4 sm:p-5 shadow-xs border-2 border-border/80">
                        <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                                <div className="flex-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                                        <Search className="h-4 w-4 text-primary" />
                                    </div>
                                    <Input
                                        value={path}
                                        onChange={(e) => setPath(e.target.value)}
                                        placeholder="Enter JSONPath expression, e.g. $.store.book[*].title"
                                        className={`pl-9 font-mono text-sm h-10 ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleLoadSample}
                                        className="gap-1.5 h-10 text-xs font-medium text-muted-foreground hover:text-foreground"
                                        title="Load sample JSON payload and query"
                                    >
                                        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                                        <span>Load Sample</span>
                                    </Button>

                                    <Button
                                        variant={isFullscreen ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setIsFullscreen(!isFullscreen)}
                                        className="gap-1.5 h-10 text-xs font-medium"
                                        title={isFullscreen ? "Exit Fullscreen (Esc)" : "Expand Fullscreen"}
                                    >
                                        {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                                        <span className="hidden sm:inline">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
                                        {isFullscreen && <kbd className="hidden sm:inline-block px-1 py-0.2 bg-primary-foreground/20 rounded text-[10px] ml-1">ESC</kbd>}
                                    </Button>
                                </div>
                            </div>

                            {/* Cheatsheet Quick Chips */}
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                    <BookOpen className="h-3.5 w-3.5" /> Examples:
                                </span>
                                {CHEATSHEET.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setPath(item.path)}
                                        className="text-[11px] px-2.5 py-1 rounded-md bg-muted hover:bg-primary/10 hover:text-primary transition-colors font-mono cursor-pointer border border-border/50"
                                        title={item.label}
                                    >
                                        {item.path}
                                    </button>
                                ))}
                            </div>

                            {error && (
                                <p className="text-xs text-destructive flex items-center gap-1.5 font-mono pt-1">
                                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                                    {error}
                                </p>
                            )}
                        </div>
                    </Card>

                    {/* Dual Editors Layout */}
                    <div className={`grid lg:grid-cols-2 gap-4 sm:gap-6 ${isFullscreen ? 'flex-1 min-h-0' : 'h-[600px]'}`}>
                        {/* JSON Input */}
                        <Card className={`flex flex-col border-2 overflow-hidden h-full shadow-xs ${jsonError ? 'border-red-200 dark:border-red-900' : 'border-border'}`}>
                            <div className="p-3 bg-muted/30 border-b flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileJson className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-medium">JSON Source</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Button
                                        onClick={handleBeautify}
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                                        title="Beautify JSON"
                                    >
                                        <Wand2 className="h-3 w-3" />
                                        <span className="hidden sm:inline">Beautify</span>
                                    </Button>
                                    <Button
                                        onClick={() => fileInputRef.current?.click()}
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                        title="Upload JSON file"
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
                                        onClick={handleReset}
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                        title="Clear Input"
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
                                        minimap: { enabled: false },
                                        fontSize: 13,
                                        lineNumbers: 'on',
                                        folding: true,
                                        automaticLayout: true,
                                        scrollBeyondLastLine: false,
                                    }}
                                />
                                {jsonError && (
                                    <div className="absolute bottom-4 left-4 right-4 bg-red-100 dark:bg-red-900/90 text-red-700 dark:text-red-200 p-2 rounded text-xs font-mono border border-red-200 dark:border-red-800 shadow-sm z-10 transition-all animate-in slide-in-from-bottom-2">
                                        JSON Syntax Error: {jsonError}
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Result Output */}
                        <Card className="flex flex-col border-2 border-border overflow-hidden h-full shadow-xs">
                            <div className="p-3 bg-muted/30 border-b flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Play className="h-4 w-4 text-emerald-500 fill-emerald-500/20" />
                                    <span className="text-sm font-medium">Query Result</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-mono font-medium">
                                        {matchCount} {matchCount === 1 ? 'match' : 'matches'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        onClick={handleCopy}
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                                        title="Copy Result"
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
                                        title="Download Result JSON"
                                        disabled={!output}
                                    >
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
