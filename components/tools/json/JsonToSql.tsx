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
    Database,
    Maximize2,
    Minimize2,
    Wand2,
    Sparkles
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
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { format as formatSql } from 'sql-formatter';

interface JsonToSqlProps {
    title: string;
    description: string;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
}

const SAMPLE_JSON = `[
  {
    "id": 1,
    "name": "Sarah Connor",
    "email": "sarah@example.com",
    "is_active": true,
    "role": "admin",
    "credits": 150.50
  },
  {
    "id": 2,
    "name": "John Connor",
    "email": "john@example.com",
    "is_active": false,
    "role": "user",
    "credits": 25.00
  },
  {
    "id": 3,
    "name": "Kyle Reese",
    "email": "kyle@example.com",
    "is_active": true,
    "role": "user",
    "credits": 0.00
  }
]`;

export function JsonToSql({ title, description, features, useCases, faq }: JsonToSqlProps) {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [tableName, setTableName] = useState('users');
    const [mode, setMode] = useState<'both' | 'insert' | 'create'>('both');
    const [dialect, setDialect] = useState<'postgresql' | 'mysql' | 'sqlite'>('postgresql');

    const handleLoadSample = () => {
        setInput(SAMPLE_JSON);
        setTableName('users');
    };
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
    const [copied, setCopied] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const { theme } = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFullscreen]);

    const inferSqlType = (value: any): string => {
        if (value === null || value === undefined) return 'TEXT';
        if (typeof value === 'boolean') return 'BOOLEAN';
        if (typeof value === 'number') {
            return Number.isInteger(value) ? 'INTEGER' : 'NUMERIC(10,2)';
        }
        if (typeof value === 'object') return 'JSONB';
        return 'VARCHAR(255)';
    };

    const sanitizeIdentifier = (name: string): string => {
        return name.replace(/[^a-zA-Z0-9_]/g, '_');
    };

    const escapeSqlValue = (val: any): string => {
        if (val === null || val === undefined) return 'NULL';
        if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
        if (typeof val === 'number') return val.toString();
        if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
        return `'${String(val).replace(/'/g, "''")}'`;
    };

    const handleConvert = useCallback(() => {
        if (!input.trim()) {
            setError(null);
            setStatus('idle');
            setOutput('');
            return;
        }

        try {
            let data = JSON.parse(input);
            if (!Array.isArray(data)) {
                if (typeof data === 'object' && data !== null) {
                    data = [data];
                } else {
                    throw new Error('JSON input must be an array of objects or a single object.');
                }
            }

            if (data.length === 0) {
                throw new Error('JSON array is empty.');
            }

            const table = sanitizeIdentifier(tableName.trim() || 'my_table');
            
            // Gather all unique keys across all records
            const columnTypeMap: Map<string, string> = new Map();
            data.forEach((row: any) => {
                if (typeof row === 'object' && row !== null) {
                    Object.keys(row).forEach((k) => {
                        const cleanKey = sanitizeIdentifier(k);
                        if (!columnTypeMap.has(cleanKey)) {
                            columnTypeMap.set(cleanKey, inferSqlType(row[k]));
                        }
                    });
                }
            });

            const columns = Array.from(columnTypeMap.keys());
            if (columns.length === 0) {
                throw new Error('No valid properties found in JSON objects.');
            }

            const sqlStatements: string[] = [];

            // CREATE TABLE
            if (mode === 'both' || mode === 'create') {
                const colDefs = columns.map(c => `  ${c} ${columnTypeMap.get(c)}`).join(',\n');
                sqlStatements.push(`CREATE TABLE IF NOT EXISTS ${table} (\n${colDefs}\n);`);
            }

            // INSERT STATEMENTS
            if (mode === 'both' || mode === 'insert') {
                const rowsSql = data.map((row: any) => {
                    const values = columns.map(col => escapeSqlValue(row[col]));
                    return `(${values.join(', ')})`;
                });

                if (dialect === 'postgresql' || dialect === 'sqlite') {
                    // Batch INSERT
                    sqlStatements.push(
                        `INSERT INTO ${table} (${columns.join(', ')}) VALUES\n${rowsSql.join(',\n')};`
                    );
                } else {
                    // MySQL Batch INSERT
                    sqlStatements.push(
                        `INSERT INTO \`${table}\` (\`${columns.join('`, `')}\`) VALUES\n${rowsSql.join(',\n')};`
                    );
                }
            }

            const rawSql = sqlStatements.join('\n\n');
            const formatted = formatSql(rawSql, {
                language: dialect === 'sqlite' ? 'sqlite' : dialect === 'mysql' ? 'mysql' : 'postgresql',
                tabWidth: 2,
                keywordCase: 'upper',
            });

            setOutput(formatted);
            setError(null);
            setStatus('valid');
        } catch (err: any) {
            setError(err.message || 'Failed to generate SQL');
            setStatus('invalid');
        }
    }, [input, tableName, mode, dialect]);

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
        const blob = new Blob([output], { type: 'application/sql' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${tableName || 'data'}.sql`;
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
                            <Label htmlFor="table-name" className="whitespace-nowrap text-xs font-medium">Table Name</Label>
                            <Input
                                id="table-name"
                                placeholder="users"
                                className="w-28 sm:w-32 h-8 text-xs font-mono"
                                value={tableName}
                                onChange={e => setTableName(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Label className="whitespace-nowrap text-xs font-medium">Statements</Label>
                            <Select value={mode} onValueChange={(v: 'both' | 'insert' | 'create') => setMode(v)}>
                                <SelectTrigger className="w-32 h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="both">CREATE + INSERT</SelectItem>
                                    <SelectItem value="insert">INSERT Only</SelectItem>
                                    <SelectItem value="create">CREATE TABLE</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Label className="whitespace-nowrap text-xs font-medium">Dialect</Label>
                            <Select value={dialect} onValueChange={(v: 'postgresql' | 'mysql' | 'sqlite') => setDialect(v)}>
                                <SelectTrigger className="w-32 h-8 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="postgresql">PostgreSQL</SelectItem>
                                    <SelectItem value="mysql">MySQL</SelectItem>
                                    <SelectItem value="sqlite">SQLite</SelectItem>
                                </SelectContent>
                            </Select>
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
                                Convert to SQL
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
                                    <span className="text-sm font-medium">JSON Array</span>
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

                        {/* SQL Output */}
                        <Card className="flex flex-col border-2 border-border overflow-hidden h-full shadow-xs">
                            <div className="p-3 bg-muted/30 border-b flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Database className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm font-medium">SQL Output</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        onClick={handleCopy}
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                                        title="Copy SQL"
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
                                        title="Download .sql"
                                        disabled={!output}
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex-1">
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
                                Convert to SQL
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
