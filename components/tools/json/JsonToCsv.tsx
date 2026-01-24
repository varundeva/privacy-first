'use client';

import { useState, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ToolHeader } from '../ToolHeader';
import {
    Copy,
    Check,
    AlertCircle,
    FileSpreadsheet,
    ArrowRightLeft,
    Download,
    Lightbulb,
    HelpCircle,
    ChevronDown,
    ChevronRight,
    FileType,
    Trash2,
    Upload,
    Grid3X3,
    FileText
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
import { CsvGridView } from './CsvGridView';

interface JsonToCsvProps {
    title: string;
    description: string;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
}

export function JsonToCsv({ title, description, features, useCases, faq }: JsonToCsvProps) {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
    const [viewMode, setViewMode] = useState<'text' | 'grid'>('text');
    const { theme } = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const flattenObject = (obj: any, prefix = '', res: any = {}) => {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const val = obj[key];
                const newKey = prefix ? `${prefix}.${key}` : key;
                if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
                    flattenObject(val, newKey, res);
                } else if (Array.isArray(val)) {
                    res[newKey] = JSON.stringify(val);
                } else {
                    res[newKey] = val;
                }
            }
        }
        return res;
    };

    const handleConvert = () => {
        if (!input.trim()) {
            setError(null);
            setStatus('idle');
            return;
        }

        try {
            const parsed = JSON.parse(input);
            let items: any[] = [];

            if (Array.isArray(parsed)) {
                items = parsed;
            } else if (typeof parsed === 'object' && parsed !== null) {
                items = [parsed];
            } else {
                throw new Error('Input must be a JSON object or array of objects');
            }

            if (items.length === 0) {
                setOutput('');
                setStatus('valid');
                return;
            }

            const flatItems = items.map(item => {
                if (typeof item !== 'object' || item === null) return { value: item };
                return flattenObject(item);
            });

            const headers = Array.from(new Set(flatItems.flatMap(Object.keys)));

            if (headers.length === 0) {
                setOutput('');
                setStatus('valid');
                return;
            }

            const csvRows = [
                headers.join(','),
                ...flatItems.map(item => {
                    return headers.map(header => {
                        let val = item[header];
                        if (val === undefined || val === null) val = '';
                        const strVal = String(val);
                        if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')) {
                            return `"${strVal.replace(/"/g, '""')}"`;
                        }
                        return strVal;
                    }).join(',');
                })
            ];

            setOutput(csvRows.join('\n'));
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

    const handleDownload = () => {
        if (!output) return;
        const blob = new Blob([output], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'converted.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(output);
        } catch (err) {
            console.error('Failed to copy', err);
        }
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
        const errors = markers.filter(m => m.severity === 8);
        if (errors.length > 0) {
            setError(errors[0].message);
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

            <main className="flex-1 mx-auto max-w-7xl px-4 py-8 sm:px-6 w-full space-y-8">
                {/* Editors Layout */}
                <div className="grid lg:grid-cols-2 gap-6 h-[600px]">
                    {/* JSON Input */}
                    <Card className={`flex flex-col border-2 overflow-hidden h-full ${status === 'invalid' ? 'border-red-200 dark:border-red-900' : 'border-border'
                        }`}>
                        <div className="p-3 bg-muted/30 border-b flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet className="h-4 w-4" />
                                <span className="text-sm font-medium">JSON Input</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-0.5 rounded ${status === 'valid' ? 'bg-green-100 text-green-700' :
                                        status === 'invalid' ? 'bg-red-100 text-red-700' : ''
                                    }`}>
                                    {status === 'valid' ? 'Valid' : status === 'invalid' ? 'Error' : ''}
                                </span>
                                <Button
                                    onClick={() => fileInputRef.current?.click()}
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
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
                            </div>
                        </div>
                        <div className="flex-1 relative">
                            <Editor
                                height="100%"
                                language="json"
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
                                <div className="absolute bottom-4 left-4 right-4 bg-red-100 dark:bg-red-900/90 text-red-700 dark:text-red-200 p-2 rounded text-xs font-mono border border-red-200 dark:border-red-800 shadow-sm z-10">
                                    {error}
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* CSV Output */}
                    <Card className="flex flex-col border-2 border-border overflow-hidden h-full">
                        <div className="p-3 bg-muted/30 border-b flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <FileType className="h-4 w-4" />
                                    <span className="text-sm font-medium">CSV Output</span>
                                </div>
                                {/* View Toggle */}
                                <div className="flex items-center bg-background border rounded-md p-0.5 h-7">
                                    <button
                                        onClick={() => setViewMode('text')}
                                        className={`px-2 flex items-center gap-1.5 text-xs font-medium rounded-sm h-full transition-all ${viewMode === 'text' ? 'bg-muted text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        <FileText className="h-3 w-3" />
                                        Text
                                    </button>
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`px-2 flex items-center gap-1.5 text-xs font-medium rounded-sm h-full transition-all ${viewMode === 'grid' ? 'bg-muted text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        <Grid3X3 className="h-3 w-3" />
                                        Grid
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <Button onClick={handleCopy} variant="ghost" size="icon" className="h-7 w-7" title="Copy CSV">
                                    <Copy className="h-3.5 w-3.5" />
                                </Button>
                                <Button onClick={handleDownload} variant="ghost" size="icon" className="h-7 w-7" title="Download CSV">
                                    <Download className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex-1 relative overflow-hidden">
                            {viewMode === 'text' ? (
                                <Editor
                                    height="100%"
                                    language="csv"
                                    value={output}
                                    theme={editorTheme}
                                    options={{
                                        readOnly: true,
                                        minimap: { enabled: false },
                                        fontSize: 13,
                                        lineNumbers: 'on',
                                        automaticLayout: true,
                                        scrollBeyondLastLine: false,
                                    }}
                                />
                            ) : (
                                <CsvGridView data={output} />
                            )}
                        </div>
                    </Card>
                </div>

                {/* Actions */}
                <div className="flex justify-center gap-4">
                    <Button onClick={handleReset} variant="outline" size="lg" className="gap-2 px-8 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50">
                        <Trash2 className="h-5 w-5" />
                        Reset
                    </Button>
                    <Button onClick={handleConvert} size="lg" className="gap-2 px-8">
                        <ArrowRightLeft className="h-5 w-5" />
                        Convert to CSV
                    </Button>
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
