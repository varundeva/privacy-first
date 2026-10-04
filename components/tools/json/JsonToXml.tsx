'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
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
    ArrowRightLeft,
    Download,
    Lightbulb,
    HelpCircle,
    Trash2,
    Settings2,
    Upload,
    FileCode2,
    Maximize2,
    Minimize2,
    Wand2,
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
import { XMLBuilder } from 'fast-xml-parser';

interface JsonToXmlProps {
    title: string;
    description: string;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
}

const SAMPLE_JSON = `{
  "catalog": {
    "book": [
      {
        "@_id": "bk101",
        "author": "Gambardella, Matthew",
        "title": "XML Developer's Guide",
        "genre": "Computer",
        "price": 44.95,
        "publish_date": "2000-10-01"
      },
      {
        "@_id": "bk102",
        "author": "Ralls, Kim",
        "title": "Midnight Rain",
        "genre": "Fantasy",
        "price": 5.95,
        "publish_date": "2000-12-16"
      }
    ]
  }
}`;

export function JsonToXml({ title, description, features, useCases, faq }: JsonToXmlProps) {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [rootTag, setRootTag] = useState('');
    const [attrPrefix, setAttrPrefix] = useState('@_');

    const handleLoadSample = () => {
        setInput(SAMPLE_JSON);
        setRootTag('');
        setAttrPrefix('@_');
    };
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
    const [copied, setCopied] = useState(false);
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

    const handleConvert = useCallback(() => {
        if (!input.trim()) {
            setError(null);
            setStatus('idle');
            setOutput('');
            return;
        }

        try {
            const parsed = JSON.parse(input);
            const builder = new XMLBuilder({
                format: true,
                indentBy: '  ',
                attributeNamePrefix: attrPrefix || '@_',
                ignoreAttributes: false,
                suppressEmptyNode: true,
            });

            let dataToConvert = parsed;
            if (rootTag.trim()) {
                dataToConvert = { [rootTag.trim()]: parsed };
            }

            const xmlResult = '<?xml version="1.0" encoding="UTF-8"?>\n' + builder.build(dataToConvert);
            setOutput(xmlResult);
            setError(null);
            setStatus('valid');
        } catch (err: any) {
            setError(err.message || 'Invalid JSON input');
            setStatus('invalid');
        }
    }, [input, rootTag, attrPrefix]);

    useEffect(() => {
        handleConvert();
    }, [handleConvert]);

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
        const blob = new Blob([output], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.xml';
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
        setOutput('');
        setError(null);
        setStatus('idle');
    };

    const editorTheme = theme === 'dark' ? 'vs-dark' : 'light';

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <ToolHeader title={title} description={description} />

            <main className="flex-1 mx-auto px-4 py-8 sm:px-6 w-full max-w-[96%] xl:max-w-[94%] 2xl:max-w-[1700px] space-y-8">
                {/* Workspace Container */}
                <div className={isFullscreen ? 'fixed inset-0 z-50 bg-background flex flex-col p-4 sm:p-6 overflow-hidden space-y-4' : 'space-y-6'}>
                    {/* Options Toolbar */}
                    <div className="flex flex-wrap gap-4 sm:gap-6 p-4 border rounded-xl bg-card items-center shadow-xs">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                <Settings2 className="h-4 w-4" />
                            </div>
                            <span className="font-semibold text-sm">Options</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Label htmlFor="root-tag" className="whitespace-nowrap text-xs font-medium">Root Element (Optional)</Label>
                            <Input
                                id="root-tag"
                                placeholder="root"
                                className="w-28 sm:w-32 h-8 text-xs font-mono"
                                value={rootTag}
                                onChange={e => setRootTag(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Label htmlFor="attr-prefix" className="whitespace-nowrap text-xs font-medium">Attr Prefix</Label>
                            <Input
                                id="attr-prefix"
                                placeholder="@_"
                                className="w-16 h-8 text-xs font-mono"
                                value={attrPrefix}
                                onChange={e => setAttrPrefix(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2 ml-auto">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLoadSample}
                                className="gap-1.5 h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
                                title="Load sample JSON"
                            >
                                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                                <span>Load Sample</span>
                            </Button>

                            <Button
                                onClick={handleConvert}
                                size="sm"
                                className="gap-1.5 h-8 text-xs font-medium"
                            >
                                <ArrowRightLeft className="h-3.5 w-3.5" />
                                Convert to XML
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
                        {/* JSON Input */}
                        <Card className={`flex flex-col border-2 overflow-hidden h-full shadow-xs ${status === 'invalid' ? 'border-red-200 dark:border-red-900' : 'border-border'}`}>
                            <div className="p-3 bg-muted/30 border-b flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileJson className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-medium">JSON Input</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className={`text-xs px-2 py-0.5 rounded font-mono ${status === 'valid' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' :
                                            status === 'invalid' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' : ''
                                        }`}>
                                        {status === 'valid' ? 'Valid' : status === 'invalid' ? 'Error' : ''}
                                    </span>
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
                                        title="Upload JSON"
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
                                        title="Reset"
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
                                {error && (
                                    <div className="absolute bottom-4 left-4 right-4 bg-red-100 dark:bg-red-900/90 text-red-700 dark:text-red-200 p-2 rounded text-xs font-mono border border-red-200 dark:border-red-800 shadow-sm z-10 transition-all animate-in slide-in-from-bottom-2">
                                        {error}
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* XML Output */}
                        <Card className="flex flex-col border-2 border-border overflow-hidden h-full shadow-xs">
                            <div className="p-3 bg-muted/30 border-b flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileCode2 className="h-4 w-4 text-orange-500" />
                                    <span className="text-sm font-medium">XML Output</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        onClick={handleCopy}
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                                        title="Copy XML"
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
                                        title="Download XML"
                                        disabled={!output}
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex-1">
                                <Editor
                                    height="100%"
                                    language="xml"
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

                    {/* Actions in normal mode */}
                    {!isFullscreen && (
                        <div className="flex justify-center gap-4">
                            <Button onClick={handleReset} variant="outline" size="lg" className="gap-2 px-8 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50">
                                <Trash2 className="h-5 w-5" />
                                Reset
                            </Button>
                            <Button onClick={handleConvert} size="lg" className="gap-2 px-8">
                                <ArrowRightLeft className="h-5 w-5" />
                                Convert to XML
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
