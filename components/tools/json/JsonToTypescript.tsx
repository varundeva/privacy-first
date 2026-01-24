'use client';

import { useState, useCallback, useRef } from 'react';
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
    FileCode,
    Trash2,
    Settings2,
    Upload
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import Editor, { OnValidate } from '@monaco-editor/react';
import { useTheme } from 'next-themes';

interface JsonToTypescriptProps {
    title: string;
    description: string;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
}

export function JsonToTypescript({ title, description, features, useCases, faq }: JsonToTypescriptProps) {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
    const { theme } = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Options
    const [rootName, setRootName] = useState('Root');
    const [useTypeAlias, setUseTypeAlias] = useState(false); // false = interface, true = type

    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    const generateTypes = (json: any, rootName: string): string => {
        const interfaces: Map<string, string> = new Map();

        // Helper to infer type
        const getType = (value: any, keyName: string): string => {
            if (value === null) return 'any';

            const type = typeof value;
            if (type !== 'object') {
                return type;
            }

            if (Array.isArray(value)) {
                if (value.length === 0) return 'any[]';
                // Analyze first item (naive) - could be improved to merge types of all items
                const itemType = getType(value[0], keyName + 'Item');
                return `${itemType}[]`;
            }

            // Object
            const interfaceName = capitalize(keyName);
            if (!interfaces.has(interfaceName)) {
                // Generate interface immediately to handle recursion/reference roughly
                // But simplified: extract object shape
                const fields: string[] = [];
                for (const k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        fields.push(`  ${k}: ${getType(value[k], k)};`);
                    }
                }

                const decl = useTypeAlias
                    ? `type ${interfaceName} = {\n${fields.join('\n')}\n}`
                    : `interface ${interfaceName} {\n${fields.join('\n')}\n}`;
                interfaces.set(interfaceName, decl);
            }
            return interfaceName;
        };

        getType(json, rootName);

        // Re-order so Root is last or first? Usually Root is defined last if dependencies exist, but standard output puts deps first.
        // Actually Map insertion order: deps inserted first. So Root is last. Perfect.
        return Array.from(interfaces.values()).join('\n\n');
    };

    const handleConvert = () => {
        if (!input.trim()) {
            setError(null);
            setStatus('idle');
            return;
        }

        try {
            const parsed = JSON.parse(input);
            const ts = generateTypes(parsed, rootName || 'Root');
            setOutput(ts);
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
                {/* Options Toolbar */}
                <div className="flex flex-wrap gap-6 p-4 border rounded-xl bg-card items-center">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-primary/10 text-primary rounded-lg">
                            <Settings2 className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-sm">Options</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Label htmlFor="root-name" className="whitespace-nowrap">Root Name</Label>
                        <Input
                            id="root-name"
                            className="w-32 h-8"
                            value={rootName}
                            onChange={e => setRootName(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch id="type-alias" checked={useTypeAlias} onCheckedChange={setUseTypeAlias} />
                        <Label htmlFor="type-alias">Use Type Alias</Label>
                    </div>
                </div>

                {/* Editors Layout */}
                <div className="grid lg:grid-cols-2 gap-6 h-[600px]">
                    {/* JSON Input */}
                    <Card className={`flex flex-col border-2 overflow-hidden h-full ${status === 'invalid' ? 'border-red-200 dark:border-red-900' : 'border-border'
                        }`}>
                        <div className="p-3 bg-muted/30 border-b flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileJson className="h-4 w-4" />
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
                                <div className="absolute bottom-4 left-4 right-4 bg-red-100 dark:bg-red-900/90 text-red-700 dark:text-red-200 p-2 rounded text-xs font-mono border border-red-200 dark:border-red-800 shadow-sm z-10 transition-all animate-in slide-in-from-bottom-2">
                                    {error}
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* TypeScript Output */}
                    <Card className="flex flex-col border-2 border-border overflow-hidden h-full">
                        <div className="p-3 bg-muted/30 border-b flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileCode className="h-4 w-4" />
                                <span className="text-sm font-medium">TypeScript Output</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button onClick={handleCopy} variant="ghost" size="icon" className="h-7 w-7" title="Copy TypeScript">
                                    <Copy className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex-1">
                            <Editor
                                height="100%"
                                language="typescript"
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

                {/* Actions */}
                <div className="flex justify-center gap-4">
                    <Button onClick={handleReset} variant="outline" size="lg" className="gap-2 px-8 text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50">
                        <Trash2 className="h-5 w-5" />
                        Reset
                    </Button>
                    <Button onClick={handleConvert} size="lg" className="gap-2 px-8">
                        <ArrowRightLeft className="h-5 w-5" />
                        Convert to TypeScript
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
