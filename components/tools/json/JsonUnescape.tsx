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
    Download,
    Lightbulb,
    HelpCircle,
    Trash2,
    Upload,
    Maximize2,
    Minimize2,
    ArrowLeftRight,
    Wand2,
    Code2,
    Terminal,
    Database,
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

interface JsonUnescapeProps {
    title: string;
    description: string;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
}

type ConversionMode = 'unescape' | 'escape';
type EscapeTarget = 'json_string' | 'javascript' | 'python' | 'curl' | 'java_csharp' | 'sql';

const SAMPLE_ESCAPED_STRING = `"{\\"orderId\\": \\"ord_839120\\", \\"status\\": \\"processed\\", \\"customer\\": {\\"id\\": \\"usr_102\\", \\"email\\": \\"clara@example.com\\"}, \\"items\\": [{\\"sku\\": \\"ITEM-01\\", \\"quantity\\": 2, \\"price\\": 29.99}], \\"metadata\\": {\\"source\\": \\"mobile_app\\", \\"ip\\": \\"192.168.1.1\\"}}"`;

const SAMPLE_CLEAN_JSON = `{
  "orderId": "ord_839120",
  "status": "processed",
  "customer": {
    "id": "usr_102",
    "email": "clara@example.com"
  },
  "items": [
    {
      "sku": "ITEM-01",
      "quantity": 2,
      "price": 29.99
    }
  ],
  "metadata": {
    "source": "mobile_app",
    "ip": "192.168.1.1"
  }
}`;

export function JsonUnescape({ title, description, features, useCases, faq }: JsonUnescapeProps) {
    const [mode, setMode] = useState<ConversionMode>('unescape');
    const [escapeTarget, setEscapeTarget] = useState<EscapeTarget>('json_string');
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const { theme } = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLoadSample = () => {
        setInput(mode === 'unescape' ? SAMPLE_ESCAPED_STRING : SAMPLE_CLEAN_JSON);
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

    // Unescape logic
    const handleUnescape = useCallback((raw: string): string => {
        let trimmed = raw.trim();
        if (!trimmed) return '';

        // If string starts and ends with quotes, remove outer quotes or use JSON.parse
        if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
            try {
                // If it's a valid JSON string literal e.g. "{\"a\": 1}"
                const unescapedString = JSON.parse(trimmed);
                if (typeof unescapedString === 'string') {
                    // Try parsing the unescaped content as JSON object
                    try {
                        const parsedObj = JSON.parse(unescapedString);
                        return JSON.stringify(parsedObj, null, 2);
                    } catch {
                        return unescapedString;
                    }
                } else {
                    return JSON.stringify(unescapedString, null, 2);
                }
            } catch {
                // Fallback manual unescape
                trimmed = trimmed.slice(1, -1);
            }
        }

        // Replace common escape sequences
        let manual = trimmed
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\')
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            .replace(/\\'/g, "'");

        try {
            const parsedObj = JSON.parse(manual);
            return JSON.stringify(parsedObj, null, 2);
        } catch {
            return manual;
        }
    }, []);

    // Escape logic
    const handleEscape = useCallback((raw: string, target: EscapeTarget): string => {
        if (!raw.trim()) return '';

        // First minify the JSON if possible
        let minified: string;
        try {
            minified = JSON.stringify(JSON.parse(raw));
        } catch {
            minified = raw.trim();
        }

        switch (target) {
            case 'json_string':
                // Raw JSON escaped string with surrounding quotes
                return JSON.stringify(minified);

            case 'javascript':
                // JavaScript string literal const payload = "..."
                return `const payload = ${JSON.stringify(minified)};`;

            case 'python':
                // Python raw / escaped string
                return `payload = ${JSON.stringify(minified)}`;

            case 'curl':
                // cURL CLI command snippet
                return `curl -X POST "https://api.example.com/v1/endpoint" \\\n  -H "Content-Type: application/json" \\\n  -d '${minified.replace(/'/g, "'\\''")}'`;

            case 'java_csharp':
                // Java / C# string literal with escaped quotes
                return `String jsonPayload = "${minified.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}";`;

            case 'sql':
                // SQL string with single quote escaping
                return `'${minified.replace(/'/g, "''")}'`;

            default:
                return JSON.stringify(minified);
        }
    }, []);

    // Main conversion worker
    useEffect(() => {
        if (!input.trim()) {
            setOutput('');
            setError(null);
            return;
        }

        try {
            if (mode === 'unescape') {
                const res = handleUnescape(input);
                setOutput(res);
            } else {
                const res = handleEscape(input, escapeTarget);
                setOutput(res);
            }
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Error converting JSON string');
        }
    }, [input, mode, escapeTarget, handleUnescape, handleEscape]);

    // Swap mode
    const handleSwapMode = () => {
        if (mode === 'unescape') {
            setMode('escape');
            if (output && !error) {
                setInput(output);
            } else {
                setInput(SAMPLE_CLEAN_JSON);
            }
        } else {
            setMode('unescape');
            if (output && !error) {
                setInput(output);
            } else {
                setInput(SAMPLE_ESCAPED_STRING);
            }
        }
    };

    const handleCopy = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!output) return;
        const isJson = mode === 'unescape';
        const blob = new Blob([output], { type: isJson ? 'application/json' : 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = isJson ? 'unescaped.json' : 'escaped-payload.txt';
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
                            {/* Mode switch */}
                            <div className="flex items-center flex-wrap gap-2">
                                <div className="inline-flex rounded-lg border p-1 bg-muted/40">
                                    <Button
                                        variant={mode === 'unescape' ? 'secondary' : 'ghost'}
                                        size="sm"
                                        onClick={() => setMode('unescape')}
                                        className="h-8 text-xs font-semibold px-3 gap-1.5"
                                    >
                                        <Wand2 className="h-3.5 w-3.5 text-primary" />
                                        Unescape String → JSON
                                    </Button>
                                    <Button
                                        variant={mode === 'escape' ? 'secondary' : 'ghost'}
                                        size="sm"
                                        onClick={() => setMode('escape')}
                                        className="h-8 text-xs font-semibold px-3 gap-1.5"
                                    >
                                        <Code2 className="h-3.5 w-3.5 text-primary" />
                                        Escape JSON → String
                                    </Button>
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSwapMode}
                                    className="h-8 text-xs font-medium gap-1.5"
                                    title="Swap direction & content"
                                >
                                    <ArrowLeftRight className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Swap</span>
                                </Button>
                            </div>

                            {/* Escape Target Formats (only when escaping) */}
                            {mode === 'escape' && (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs text-muted-foreground font-medium mr-1">Format:</span>
                                    {[
                                        { id: 'json_string', label: 'Escaped JSON' },
                                        { id: 'javascript', label: 'JavaScript' },
                                        { id: 'python', label: 'Python' },
                                        { id: 'curl', label: 'cURL' },
                                        { id: 'java_csharp', label: 'Java / C#' },
                                        { id: 'sql', label: 'SQL' }
                                    ].map((target) => (
                                        <Button
                                            key={target.id}
                                            variant={escapeTarget === target.id ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setEscapeTarget(target.id as EscapeTarget)}
                                            className="h-7 text-xs px-2.5"
                                        >
                                            {target.label}
                                        </Button>
                                    ))}
                                </div>
                            )}

                            {/* Action Buttons */}
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
                                    <span className="text-sm font-medium">
                                        {mode === 'unescape' ? 'Escaped JSON String' : 'Clean JSON Object'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Button
                                        onClick={() => fileInputRef.current?.click()}
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                        title="Upload File"
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
                                    language={mode === 'unescape' ? 'plaintext' : 'json'}
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

                        {/* Converted Output Editor */}
                        <Card className="flex flex-col border-2 border-border overflow-hidden shadow-xs">
                            <div className="p-3 bg-muted/40 border-b flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-sm font-medium">
                                        {mode === 'unescape' ? 'Unescaped & Formatted JSON' : `Escaped String (${escapeTarget.toUpperCase()})`}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Button
                                        onClick={handleCopy}
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                                        title="Copy Converted Result"
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
                                        title="Download File"
                                        disabled={!output}
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex-1 min-h-0">
                                <Editor
                                    height="100%"
                                    language={mode === 'unescape' ? 'json' : 'plaintext'}
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
