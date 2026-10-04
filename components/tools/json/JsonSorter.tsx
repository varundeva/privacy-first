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
    ArrowDownAZ,
    ArrowUpAZ,
    ArrowUpDown,
    CheckCircle2,
    Pin,
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

interface JsonSorterProps {
    title: string;
    description: string;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
}

const SAMPLE_UNSORTED_JSON = `{
  "z_index": 999,
  "name": "Acme Platform Configuration",
  "version": "3.1.0",
  "author": "Engineering Team",
  "id": "cfg_940182",
  "active": true,
  "settings": {
    "timeoutMs": 5000,
    "debug": false,
    "allowedHosts": ["localhost", "acme.org", "api.acme.org"],
    "apiKey": "ak_live_891230",
    "cacheEnabled": true
  },
  "database": {
    "port": 5432,
    "user": "postgres_admin",
    "host": "db.internal.acme.net",
    "connections": {
      "min": 5,
      "max": 50,
      "idleTimeout": 10000
    },
    "databaseName": "production_cluster"
  }
}`;

export function JsonSorter({ title, description, features, useCases, faq }: JsonSorterProps) {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [sortArrays, setSortArrays] = useState(false);
    const [pinTopKeys, setPinTopKeys] = useState(true);
    const [copied, setCopied] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const { theme } = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLoadSample = () => {
        setInput(SAMPLE_UNSORTED_JSON);
    };

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

    // Priority keys to pin at top when pinTopKeys is enabled
    const TOP_PRIORITY_KEYS = useMemo(() => ['id', '_id', 'uuid', 'name', 'title', 'type', 'status', 'version'], []);

    // Recursive sort function
    const sortObjectKeys = useCallback((obj: any, dir: 'asc' | 'desc', doSortArrays: boolean, pinPriority: boolean): any => {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        if (Array.isArray(obj)) {
            const mapped = obj.map(item => sortObjectKeys(item, dir, doSortArrays, pinPriority));
            if (doSortArrays) {
                // If all primitive strings or numbers, sort them
                const allPrimitive = mapped.every(v => typeof v === 'string' || typeof v === 'number');
                if (allPrimitive) {
                    return [...mapped].sort((a, b) => {
                        const cmp = String(a).localeCompare(String(b), undefined, { numeric: true });
                        return dir === 'asc' ? cmp : -cmp;
                    });
                }
            }
            return mapped;
        }

        // Sort object keys
        const keys = Object.keys(obj);

        keys.sort((a, b) => {
            if (pinPriority) {
                const aPriority = TOP_PRIORITY_KEYS.indexOf(a.toLowerCase());
                const bPriority = TOP_PRIORITY_KEYS.indexOf(b.toLowerCase());

                if (aPriority !== -1 && bPriority !== -1) {
                    return aPriority - bPriority;
                }
                if (aPriority !== -1) return -1;
                if (bPriority !== -1) return 1;
            }

            const cmp = a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
            return dir === 'asc' ? cmp : -cmp;
        });

        const sortedObj: Record<string, any> = {};
        for (const key of keys) {
            sortedObj[key] = sortObjectKeys(obj[key], dir, doSortArrays, pinPriority);
        }

        return sortedObj;
    }, [TOP_PRIORITY_KEYS]);

    // Perform sorting
    useEffect(() => {
        if (!input.trim()) {
            setOutput('');
            setError(null);
            return;
        }

        try {
            const parsed = JSON.parse(input);
            const sorted = sortObjectKeys(parsed, sortDirection, sortArrays, pinTopKeys);
            setOutput(JSON.stringify(sorted, null, 2));
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Invalid JSON syntax. Fix syntax errors to sort keys.');
        }
    }, [input, sortDirection, sortArrays, pinTopKeys, sortObjectKeys]);

    const handleCopy = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!output) return;
        const blob = new Blob([output], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sorted.json';
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
                    {/* Top Toolbar */}
                    <Card className="p-4 sm:p-5 shadow-xs border-2 border-border/80">
                        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                            {/* Sorting Mode Badges */}
                            <div className="flex items-center flex-wrap gap-2">
                                <div className="inline-flex rounded-lg border p-1 bg-muted/40">
                                    <Button
                                        variant={sortDirection === 'asc' ? 'secondary' : 'ghost'}
                                        size="sm"
                                        onClick={() => setSortDirection('asc')}
                                        className="h-8 text-xs font-semibold px-3 gap-1.5"
                                    >
                                        <ArrowDownAZ className="h-3.5 w-3.5 text-primary" />
                                        Ascending (A → Z)
                                    </Button>
                                    <Button
                                        variant={sortDirection === 'desc' ? 'secondary' : 'ghost'}
                                        size="sm"
                                        onClick={() => setSortDirection('desc')}
                                        className="h-8 text-xs font-semibold px-3 gap-1.5"
                                    >
                                        <ArrowUpAZ className="h-3.5 w-3.5 text-primary" />
                                        Descending (Z → A)
                                    </Button>
                                </div>

                                <Button
                                    variant={pinTopKeys ? 'secondary' : 'outline'}
                                    size="sm"
                                    onClick={() => setPinTopKeys(!pinTopKeys)}
                                    className="h-8 text-xs font-medium gap-1.5 border"
                                    title="Keep id, name, type, and status at the top of objects"
                                >
                                    <Pin className={`h-3.5 w-3.5 ${pinTopKeys ? 'text-primary' : 'text-muted-foreground'}`} />
                                    <span>Pin 'id/name' First</span>
                                </Button>

                                <Button
                                    variant={sortArrays ? 'secondary' : 'outline'}
                                    size="sm"
                                    onClick={() => setSortArrays(!sortArrays)}
                                    className="h-8 text-xs font-medium gap-1.5 border"
                                    title="Alphabetize string and number array elements"
                                >
                                    <Sliders className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span>Sort Arrays</span>
                                </Button>
                            </div>

                            {/* Actions & Fullscreen */}
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={handleLoadSample}
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5 h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
                                    title="Load sample data"
                                >
                                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                                    <span>Load Sample</span>
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
                        {/* Input Editor */}
                        <Card className={`flex flex-col border-2 overflow-hidden shadow-xs ${error ? 'border-rose-300 dark:border-rose-900' : 'border-border'}`}>
                            <div className="p-3 bg-muted/40 border-b flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileJson className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-medium">Unsorted JSON Input</span>
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

                        {/* Sorted Output Editor */}
                        <Card className="flex flex-col border-2 border-border overflow-hidden shadow-xs">
                            <div className="p-3 bg-muted/40 border-b flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-sm font-medium">Sorted JSON Output ({sortDirection.toUpperCase()})</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Button
                                        onClick={handleCopy}
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                                        title="Copy Sorted JSON"
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
                                        title="Download Sorted JSON"
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
