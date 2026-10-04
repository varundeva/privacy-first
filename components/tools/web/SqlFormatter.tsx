'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ToolHeader } from '../ToolHeader';
import {
    Copy,
    Check,
    Database,
    ArrowRightLeft,
    Download,
    Lightbulb,
    HelpCircle,
    Trash2,
    Settings2,
    Upload,
    Code,
    Maximize2,
    Minimize2,
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { format } from 'sql-formatter';

interface SqlFormatterProps {
    title: string;
    description: string;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
}

const DIALECTS = [
    { label: 'Standard SQL', value: 'sql' },
    { label: 'MySQL', value: 'mysql' },
    { label: 'PostgreSQL', value: 'postgresql' },
    { label: 'MariaDB', value: 'mariadb' },
    { label: 'Oracle', value: 'oracle' },
    { label: 'SQLite', value: 'sqlite' },
    { label: 'SQL Server', value: 'tsql' },
    { label: 'BigQuery', value: 'bigquery' },
];

export function SqlFormatter({ title, description, features, useCases, faq }: SqlFormatterProps) {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [dialect, setDialect] = useState('sql');
    const [upperCase, setUpperCase] = useState(true);
    const [indentSize, setIndentSize] = useState('2');
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
            setOutput('');
            setError(null);
            return;
        }

        try {
            const formatted = format(input, {
                language: dialect as any,
                tabWidth: parseInt(indentSize),
                keywordCase: upperCase ? 'upper' : 'lower',
            });
            setOutput(formatted);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to format SQL');
        }
    };

    const handleMinify = () => {
        if (!input.trim()) return;
        try {
            // Very basic minification: remove comments and extra whitespace
            const minified = input
                .replace(/\/\*[\s\S]*?\*\/|--.*$/gm, '') // Remove comments
                .replace(/\s+/g, ' ') // Collapse whitespace
                .trim();
            setOutput(minified);
            setError(null);
        } catch (err) {
            setError('Failed to minify SQL');
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
        const blob = new Blob([output], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'formatted.sql';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleReset = () => {
        setInput('');
        setOutput('');
        setError(null);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (text) setInput(text);
        };
        reader.readAsText(file);
    };

    const editorTheme = theme === 'dark' ? 'vs-dark' : 'light';

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <ToolHeader title={title} description={description} />

            <main className="flex-1 mx-auto px-4 py-8 sm:px-6 w-full max-w-[96%] xl:max-w-[94%] 2xl:max-w-[1700px] space-y-8">
                {/* Editor Workspace Container */}
                <div className={isFullscreen ? 'fixed inset-0 z-50 bg-background flex flex-col p-4 sm:p-6 overflow-hidden space-y-4' : 'space-y-6'}>
                    {/* Options Toolbar */}
                    <div className="flex flex-wrap gap-4 sm:gap-6 p-3 sm:p-4 border rounded-xl bg-card items-center justify-between shadow-sm">
                        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
                                    <Settings2 className="h-4 w-4" />
                                </div>
                                <span className="font-semibold text-sm">Formatting Options</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Label htmlFor="dialect" className="text-xs">Dialect</Label>
                                <Select value={dialect} onValueChange={setDialect}>
                                    <SelectTrigger className="w-[150px] h-9 text-xs">
                                        <SelectValue placeholder="Select Dialect" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DIALECTS.map(d => (
                                            <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center gap-2">
                                <Label htmlFor="indent" className="text-xs">Indent</Label>
                                <Select value={indentSize} onValueChange={setIndentSize}>
                                    <SelectTrigger className="w-[95px] h-9 text-xs">
                                        <SelectValue placeholder="Size" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="2">2 Spaces</SelectItem>
                                        <SelectItem value="4">4 Spaces</SelectItem>
                                        <SelectItem value="8">8 Spaces</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch id="uppercase" checked={upperCase} onCheckedChange={setUpperCase} />
                                <Label htmlFor="uppercase" className="text-xs">Uppercase Keywords</Label>
                            </div>
                        </div>

                        {/* Fullscreen Button */}
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

                    {/* Editors Layout */}
                    <div className={`grid lg:grid-cols-2 gap-4 sm:gap-6 ${isFullscreen ? 'flex-1 min-h-0' : 'h-[600px]'}`}>
                        {/* SQL Input */}
                        <Card className="flex flex-col border-2 overflow-hidden h-full shadow-md">
                            <div className="p-3 bg-muted/30 border-b flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Database className="h-4 w-4 text-indigo-500" />
                                    <span className="text-sm font-medium">Input SQL</span>
                                </div>
                                <Button onClick={() => fileInputRef.current?.click()} variant="ghost" size="icon" className="h-7 w-7">
                                    <Upload className="h-3.5 w-3.5" />
                                    <input type="file" ref={fileInputRef} className="hidden" accept=".sql,.txt" onChange={handleFileUpload} />
                                </Button>
                            </div>
                            <div className="flex-1 relative">
                                <Editor
                                    height="100%"
                                    language="sql"
                                    value={input}
                                    theme={editorTheme}
                                    onChange={(val) => setInput(val || '')}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 13,
                                        lineNumbers: 'on',
                                        automaticLayout: true,
                                        padding: { top: 10, bottom: 10 }
                                    }}
                                />
                            </div>
                        </Card>

                        {/* SQL Output */}
                        <Card className="flex flex-col border-2 overflow-hidden h-full shadow-md">
                            <div className="p-3 bg-muted/30 border-b flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Code className="h-4 w-4 text-emerald-500" />
                                    <span className="text-sm font-medium">Formatted SQL</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button onClick={handleCopy} variant="ghost" size="icon" className="h-7 w-7" title="Copy output">
                                        <Copy className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button onClick={handleDownload} variant="ghost" size="icon" className="h-7 w-7" title="Download SQL">
                                        <Download className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex-1 relative">
                                <Editor
                                    height="100%"
                                    language="sql"
                                    value={output}
                                    theme={editorTheme}
                                    options={{
                                        readOnly: true,
                                        minimap: { enabled: false },
                                        fontSize: 13,
                                        lineNumbers: 'on',
                                        automaticLayout: true,
                                        padding: { top: 10, bottom: 10 }
                                    }}
                                />
                                {error && (
                                    <div className="absolute bottom-4 left-4 right-4 bg-red-100 dark:bg-red-900/90 text-red-700 dark:text-red-200 p-2 rounded text-xs font-mono border border-red-200 dark:border-red-800 shadow-sm z-10 transition-all animate-in slide-in-from-bottom-2">
                                        {error}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-center gap-4 py-1">
                        <Button onClick={handleReset} variant="outline" size="sm" className="gap-2 px-6 h-9 text-xs text-destructive border-destructive/20 hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                            <span>Reset</span>
                        </Button>
                        <Button onClick={handleMinify} variant="secondary" size="sm" className="gap-2 px-6 h-9 text-xs">
                            <span>Minify</span>
                        </Button>
                        <Button onClick={handleFormat} size="sm" className="gap-2 px-8 h-9 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">
                            <ArrowRightLeft className="h-4 w-4" />
                            <span>Format SQL</span>
                        </Button>
                    </div>
                </div>

                {/* Info Section */}
                {((features && features.length > 0) || (useCases && useCases.length > 0) || (faq && faq.length > 0)) && (
                    <div className="grid gap-8 pt-8 border-t">
                        <div className="grid gap-8 md:grid-cols-2">
                            {features && features.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                                            <Check className="h-5 w-5" />
                                        </div>
                                        <h2 className="text-xl font-semibold">Key Features</h2>
                                    </div>
                                    <Card className="p-6 shadow-sm">
                                        <ul className="space-y-3">
                                            {features.map((f, i) => (
                                                <li key={i} className="flex items-start gap-3 text-muted-foreground">
                                                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                                                    <span>{f}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </Card>
                                </div>
                            )}
                            {useCases && useCases.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                                            <Lightbulb className="h-5 w-5" />
                                        </div>
                                        <h2 className="text-xl font-semibold">Common Use Cases</h2>
                                    </div>
                                    <Card className="p-6 shadow-sm">
                                        <ul className="space-y-3">
                                            {useCases.map((u, i) => (
                                                <li key={i} className="flex items-start gap-3 text-muted-foreground">
                                                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                                                    <span>{u}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </Card>
                                </div>
                            )}
                        </div>

                        {faq && faq.length > 0 && (
                            <div className="space-y-6 max-w-3xl mx-auto w-full">
                                <div className="flex items-center gap-2 justify-center pb-2">
                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                        <HelpCircle className="h-5 w-5" />
                                    </div>
                                    <h2 className="text-2xl font-semibold text-center">Frequently Asked Questions</h2>
                                </div>
                                <Accordion type="single" collapsible className="w-full">
                                    {faq.map((f, i) => (
                                        <AccordionItem key={i} value={`faq-${i}`}>
                                            <AccordionTrigger className="text-left font-medium">{f.question}</AccordionTrigger>
                                            <AccordionContent className="text-muted-foreground">{f.answer}</AccordionContent>
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
