'use client';

import { useState, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ToolHeader } from '../ToolHeader';
import {
    Copy,
    Check,
    FileCode,
    ArrowRightLeft,
    Download,
    Lightbulb,
    HelpCircle,
    Trash2,
    Settings2,
    Upload,
    Code,
    Minimize2
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
import { html as htmlBeautify } from 'js-beautify';

interface HtmlFormatterProps {
    title: string;
    description: string;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
}

export function HtmlFormatter({ title, description, features, useCases, faq }: HtmlFormatterProps) {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [indentSize, setIndentSize] = useState('2');
    const [wrapLineLength, setWrapLineLength] = useState('0'); // 0 for no wrap
    const [preserveNewlines, setPreserveNewlines] = useState(true);

    const { theme } = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFormat = () => {
        if (!input.trim()) {
            setOutput('');
            setError(null);
            return;
        }

        try {
            const formatted = htmlBeautify(input, {
                indent_size: parseInt(indentSize),
                wrap_line_length: parseInt(wrapLineLength),
                preserve_newlines: preserveNewlines,
                indent_inner_html: true,
                extra_liners: [],
                indent_char: ' '
            });
            setOutput(formatted);
            setError(null);
        } catch (err) {
            setError('Failed to format HTML');
        }
    };

    const handleMinify = () => {
        if (!input.trim()) return;
        try {
            // Basic minification for HTML
            const minified = input
                .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
                .replace(/\s+/g, ' ') // Collapse whitespace
                .replace(/>\s+</g, '><') // Remove whitespace between tags
                .trim();
            setOutput(minified);
            setError(null);
        } catch (err) {
            setError('Failed to minify HTML');
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
        const blob = new Blob([output], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'formatted.html';
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

            <main className="flex-1 mx-auto max-w-7xl px-4 py-8 sm:px-6 w-full space-y-8">
                {/* Options Toolbar */}
                <div className="flex flex-wrap gap-6 p-4 border rounded-xl bg-card items-center shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">
                            <Settings2 className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-sm">HTML Options</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Label htmlFor="indent">Indent</Label>
                        <Select value={indentSize} onValueChange={setIndentSize}>
                            <SelectTrigger className="w-[120px] h-9">
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
                        <Switch id="newlines" checked={preserveNewlines} onCheckedChange={setPreserveNewlines} />
                        <Label htmlFor="newlines">Preserve Newlines</Label>
                    </div>
                </div>

                {/* Editors Layout */}
                <div className="grid lg:grid-cols-2 gap-6 h-[600px]">
                    {/* HTML Input */}
                    <Card className="flex flex-col border-2 overflow-hidden h-full shadow-md">
                        <div className="p-3 bg-muted/30 border-b flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileCode className="h-4 w-4 text-orange-500" />
                                <span className="text-sm font-medium">Input HTML</span>
                            </div>
                            <Button onClick={() => fileInputRef.current?.click()} variant="ghost" size="icon" className="h-7 w-7">
                                <Upload className="h-3.5 w-3.5" />
                                <input type="file" ref={fileInputRef} className="hidden" accept=".html,.htm,.txt" onChange={handleFileUpload} />
                            </Button>
                        </div>
                        <div className="flex-1 relative">
                            <Editor
                                height="100%"
                                language="html"
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

                    {/* HTML Output */}
                    <Card className="flex flex-col border-2 overflow-hidden h-full shadow-md">
                        <div className="p-3 bg-muted/30 border-b flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Code className="h-4 w-4 text-emerald-500" />
                                <span className="text-sm font-medium">Beautified HTML</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button onClick={handleCopy} variant="ghost" size="icon" className="h-7 w-7">
                                    <Copy className="h-3.5 w-3.5" />
                                </Button>
                                <Button onClick={handleDownload} variant="ghost" size="icon" className="h-7 w-7">
                                    <Download className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex-1 relative">
                            <Editor
                                height="100%"
                                language="html"
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
                <div className="flex justify-center gap-4">
                    <Button onClick={handleReset} variant="outline" size="lg" className="gap-2 px-8 text-destructive border-destructive/20 hover:bg-destructive/10">
                        <Trash2 className="h-5 w-5" />
                        Reset
                    </Button>
                    <Button onClick={handleMinify} variant="secondary" size="lg" className="gap-2 px-8">
                        <Minimize2 className="h-4 w-4" />
                        Minify
                    </Button>
                    <Button onClick={handleFormat} size="lg" className="gap-2 px-12 bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-500/20">
                        <ArrowRightLeft className="h-5 w-5" />
                        Beautify HTML
                    </Button>
                </div>

                {/* Info Section */}
                {((features && features.length > 0) || (useCases && useCases.length > 0) || (faq && faq.length > 0)) && (
                    <div className="grid gap-8 pt-8 border-t">
                        <div className="grid gap-8 md:grid-cols-2">
                            {features && features.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                                            <Check className="h-5 w-5" />
                                        </div>
                                        <h2 className="text-xl font-semibold">Key Features</h2>
                                    </div>
                                    <Card className="p-6 shadow-sm">
                                        <ul className="space-y-3">
                                            {features.map((f, i) => (
                                                <li key={i} className="flex items-start gap-3 text-muted-foreground">
                                                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-500 flex-shrink-0" />
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
                                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                            <Lightbulb className="h-5 w-5" />
                                        </div>
                                        <h2 className="text-xl font-semibold">Common Use Cases</h2>
                                    </div>
                                    <Card className="p-6 shadow-sm">
                                        <ul className="space-y-3">
                                            {useCases.map((u, i) => (
                                                <li key={i} className="flex items-start gap-3 text-muted-foreground">
                                                    <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
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
                                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
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
