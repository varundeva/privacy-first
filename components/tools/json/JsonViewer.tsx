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
    Search,
    ChevronRight,
    ChevronDown,
    Layers,
    ListTree,
    Code,
    Sparkles,
    CheckCircle2,
    XCircle,
    Filter
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';

interface JsonViewerProps {
    title: string;
    description: string;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
}

const SAMPLE_PAYLOAD = `{
  "status": "success",
  "data": {
    "organization": "Acme Innovations",
    "region": "us-east-1",
    "tier": "enterprise",
    "settings": {
      "multiFactorAuth": true,
      "sessionTimeoutMinutes": 30,
      "allowedOrigins": [
        "https://acme.com",
        "https://app.acme.com",
        "http://localhost:3000"
      ]
    },
    "projects": [
      {
        "id": "prj_94102",
        "name": "Cloud Observability Platform",
        "status": "active",
        "budget": 45000.5,
        "contributors": 14,
        "tags": ["cloud", "metrics", "nextjs"]
      },
      {
        "id": "prj_88310",
        "name": "Zero-Knowledge Data Vault",
        "status": "in_review",
        "budget": 28000.0,
        "contributors": 6,
        "tags": ["security", "encryption", "privacy"]
      }
    ],
    "metadata": {
      "generatedAt": "2026-10-04T12:00:00Z",
      "version": "v2.4.1",
      "serverLatencyMs": 42
    }
  }
}`;

// Helper to determine type
function getValueType(val: any): 'string' | 'number' | 'boolean' | 'null' | 'array' | 'object' {
    if (val === null) return 'null';
    if (Array.isArray(val)) return 'array';
    return typeof val as 'string' | 'number' | 'boolean' | 'object';
}

// Tree Node component
interface TreeNodeProps {
    nodeKey: string | number;
    value: any;
    path: string;
    searchQuery: string;
    collapsedPaths: Set<string>;
    toggleCollapse: (path: string) => void;
    onCopyPath: (path: string) => void;
    onCopyValue: (val: any) => void;
    copiedPath: string | null;
}

function TreeNode({
    nodeKey,
    value,
    path,
    searchQuery,
    collapsedPaths,
    toggleCollapse,
    onCopyPath,
    onCopyValue,
    copiedPath
}: TreeNodeProps) {
    const type = getValueType(value);
    const isObject = type === 'object';
    const isArray = type === 'array';
    const isExpandable = isObject || isArray;
    const isCollapsed = collapsedPaths.has(path);

    // Filter match check
    const matchesSearch = useMemo(() => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const keyMatches = String(nodeKey).toLowerCase().includes(q);
        if (keyMatches) return true;
        if (!isExpandable) {
            return String(value).toLowerCase().includes(q);
        }
        // Check deep string representation
        try {
            return JSON.stringify(value).toLowerCase().includes(q);
        } catch {
            return false;
        }
    }, [searchQuery, nodeKey, value, isExpandable]);

    if (!matchesSearch) return null;

    const childEntries: [string | number, any][] = isObject 
        ? Object.entries(value) 
        : isArray 
            ? value.map((v: any, i: number): [string | number, any] => [i, v]) 
            : [];

    const badgeClasses = {
        string: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
        number: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800',
        boolean: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
        null: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
        array: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
        object: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800'
    };

    return (
        <div className="font-mono text-xs my-0.5 select-text">
            <div className="group flex items-center gap-1.5 py-1 px-1.5 rounded-md hover:bg-muted/60 transition-colors">
                {/* Expander Arrow */}
                {isExpandable ? (
                    <button
                        onClick={() => toggleCollapse(path)}
                        className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-transform"
                    >
                        {isCollapsed ? (
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-foreground" />
                        )}
                    </button>
                ) : (
                    <span className="w-4.5" />
                )}

                {/* Key Name */}
                <span className="font-semibold text-foreground/90 flex items-center">
                    {typeof nodeKey === 'number' ? (
                        <span className="text-muted-foreground">[{nodeKey}]</span>
                    ) : (
                        <span className="text-foreground">"{nodeKey}"</span>
                    )}
                    <span className="text-muted-foreground ml-1">:</span>
                </span>

                {/* Value or Summary */}
                {isExpandable ? (
                    <button
                        onClick={() => toggleCollapse(path)}
                        className="flex items-center gap-2 text-left cursor-pointer"
                    >
                        <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded border ${badgeClasses[type]}`}>
                            {isArray ? `Array [${value.length}]` : `Object {${childEntries.length}}`}
                        </span>
                        {isCollapsed && (
                            <span className="text-muted-foreground text-[11px] truncate max-w-[200px]">
                                {isArray ? `[${value.length} items...]` : `{${childEntries.length} keys...}`}
                            </span>
                        )}
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        {type === 'string' && (
                            <span className="text-emerald-600 dark:text-emerald-400 break-all">
                                "{value}"
                            </span>
                        )}
                        {type === 'number' && (
                            <span className="text-sky-600 dark:text-sky-400 font-semibold">
                                {String(value)}
                            </span>
                        )}
                        {type === 'boolean' && (
                            <span className="text-amber-600 dark:text-amber-400 font-bold">
                                {value ? 'true' : 'false'}
                            </span>
                        )}
                        {type === 'null' && (
                            <span className="text-rose-500 dark:text-rose-400 italic">
                                null
                            </span>
                        )}
                    </div>
                )}

                {/* Hover Action Badges */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 ml-auto pl-2 transition-opacity">
                    <button
                        onClick={() => onCopyPath(path)}
                        className="px-1.5 py-0.5 text-[10px] rounded bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground flex items-center gap-1"
                        title="Copy JSON Path"
                    >
                        {copiedPath === path ? <Check className="h-2.5 w-2.5 text-emerald-500" /> : <Copy className="h-2.5 w-2.5" />}
                        <span>Path</span>
                    </button>
                    {!isExpandable && (
                        <button
                            onClick={() => onCopyValue(value)}
                            className="px-1.5 py-0.5 text-[10px] rounded bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground flex items-center gap-1"
                            title="Copy Value"
                        >
                            <span>Copy Val</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Nested children */}
            {isExpandable && !isCollapsed && (
                <div className="pl-4 ml-1.5 border-l border-border/60">
                    {childEntries.map(([childKey, childVal]) => (
                        <TreeNode
                            key={childKey}
                            nodeKey={childKey}
                            value={childVal}
                            path={`${path}${isArray ? `[${childKey}]` : `.${childKey}`}`}
                            searchQuery={searchQuery}
                            collapsedPaths={collapsedPaths}
                            toggleCollapse={toggleCollapse}
                            onCopyPath={onCopyPath}
                            onCopyValue={onCopyValue}
                            copiedPath={copiedPath}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export function JsonViewer({ title, description, features, useCases, faq }: JsonViewerProps) {
    const [rawJson, setRawJson] = useState('');
    const [parsedData, setParsedData] = useState<any>(null);
    const [parseError, setParseError] = useState<string | null>(null);

    const handleLoadSample = () => {
        setRawJson(SAMPLE_PAYLOAD);
    };
    const [searchQuery, setSearchQuery] = useState('');
    const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(new Set());
    const [copiedPath, setCopiedPath] = useState<string | null>(null);
    const [copiedRaw, setCopiedRaw] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [activeTab, setActiveTab] = useState<'both' | 'tree' | 'code'>('both');
    const { theme } = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Escape key listener for fullscreen
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFullscreen]);

    // Parse JSON
    useEffect(() => {
        if (!rawJson.trim()) {
            setParsedData(null);
            setParseError(null);
            return;
        }

        try {
            const data = JSON.parse(rawJson);
            setParsedData(data);
            setParseError(null);
        } catch (err: any) {
            setParseError(err.message || 'Invalid JSON syntax');
            setParsedData(null);
        }
    }, [rawJson]);

    // Collapse / Expand handlers
    const toggleCollapse = useCallback((path: string) => {
        setCollapsedPaths(prev => {
            const next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
            } else {
                next.add(path);
            }
            return next;
        });
    }, []);

    const handleExpandAll = () => {
        setCollapsedPaths(new Set());
    };

    const handleCollapseAll = () => {
        if (!parsedData) return;
        const allPaths = new Set<string>();

        function collectPaths(obj: any, currentPath: string) {
            const t = getValueType(obj);
            if (t === 'object' || t === 'array') {
                allPaths.add(currentPath);
                if (t === 'object') {
                    for (const [k, v] of Object.entries(obj)) {
                        collectPaths(v, `${currentPath}.${k}`);
                    }
                } else {
                    obj.forEach((v: any, i: number) => {
                        collectPaths(v, `${currentPath}[${i}]`);
                    });
                }
            }
        }

        collectPaths(parsedData, '$');
        setCollapsedPaths(allPaths);
    };

    const handleCollapseToDepth = (depth: number) => {
        if (!parsedData) return;
        const newCollapsed = new Set<string>();

        function traverse(obj: any, currentPath: string, currentDepth: number) {
            const t = getValueType(obj);
            if (t === 'object' || t === 'array') {
                if (currentDepth >= depth) {
                    newCollapsed.add(currentPath);
                }
                if (t === 'object') {
                    for (const [k, v] of Object.entries(obj)) {
                        traverse(v, `${currentPath}.${k}`, currentDepth + 1);
                    }
                } else {
                    obj.forEach((v: any, i: number) => {
                        traverse(v, `${currentPath}[${i}]`, currentDepth + 1);
                    });
                }
            }
        }

        traverse(parsedData, '$', 1);
        setCollapsedPaths(newCollapsed);
    };

    // Copy handlers
    const handleCopyPath = (path: string) => {
        navigator.clipboard.writeText(path);
        setCopiedPath(path);
        setTimeout(() => setCopiedPath(null), 1500);
    };

    const handleCopyValue = (val: any) => {
        const text = typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val);
        navigator.clipboard.writeText(text);
    };

    const handleCopyRaw = () => {
        navigator.clipboard.writeText(rawJson);
        setCopiedRaw(true);
        setTimeout(() => setCopiedRaw(false), 2000);
    };

    const handleBeautify = () => {
        if (parsedData) {
            setRawJson(JSON.stringify(parsedData, null, 2));
        }
    };

    const handleDownload = () => {
        const blob = new Blob([rawJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setRawJson(event.target.result as string);
                }
            };
            reader.readAsText(file);
        }
    };

    // Tree statistics
    const stats = useMemo(() => {
        if (!parsedData) return null;
        let keys = 0;
        let arrays = 0;
        let primitives = 0;

        function count(val: any) {
            const t = getValueType(val);
            if (t === 'object') {
                const entries = Object.entries(val);
                keys += entries.length;
                entries.forEach(([, v]) => count(v));
            } else if (t === 'array') {
                arrays++;
                val.forEach((v: any) => count(v));
            } else {
                primitives++;
            }
        }

        count(parsedData);
        return { keys, arrays, primitives };
    }, [parsedData]);

    const editorTheme = theme === 'dark' ? 'vs-dark' : 'light';

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <ToolHeader title={title} description={description} />

            <main className="flex-1 mx-auto px-4 py-8 sm:px-6 w-full max-w-[96%] xl:max-w-[94%] 2xl:max-w-[1700px] space-y-8">
                {/* Workspace Container */}
                <div className={isFullscreen ? 'fixed inset-0 z-50 bg-background flex flex-col p-4 sm:p-6 overflow-hidden space-y-4' : 'space-y-6'}>
                    {/* Top Toolbar */}
                    <Card className="p-4 sm:p-5 shadow-xs border-2 border-border/80">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                            {/* Status & Stats */}
                            <div className="flex items-center flex-wrap gap-3">
                                {parsedData ? (
                                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span className="text-xs font-semibold uppercase tracking-wider">Valid JSON</span>
                                    </div>
                                ) : parseError ? (
                                    <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800">
                                        <XCircle className="h-4 w-4" />
                                        <span className="text-xs font-semibold uppercase tracking-wider">Syntax Error</span>
                                    </div>
                                ) : (
                                    <div className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-lg font-medium">
                                        Ready
                                    </div>
                                )}

                                {stats && (
                                    <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-muted-foreground border-l pl-3">
                                        <span><strong>{stats.keys}</strong> keys</span>
                                        <span><strong>{stats.arrays}</strong> arrays</span>
                                        <span><strong>{stats.primitives}</strong> values</span>
                                    </div>
                                )}
                            </div>

                            {/* View Switcher & Global Actions */}
                            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                                {/* Tab Mode Toggles */}
                                <div className="inline-flex rounded-md border p-0.5 bg-muted/30">
                                    <Button
                                        variant={activeTab === 'both' ? 'secondary' : 'ghost'}
                                        size="sm"
                                        onClick={() => setActiveTab('both')}
                                        className="h-7 text-xs px-2.5 font-medium"
                                    >
                                        <Layers className="h-3.5 w-3.5 mr-1" />
                                        Split
                                    </Button>
                                    <Button
                                        variant={activeTab === 'tree' ? 'secondary' : 'ghost'}
                                        size="sm"
                                        onClick={() => setActiveTab('tree')}
                                        className="h-7 text-xs px-2.5 font-medium"
                                    >
                                        <ListTree className="h-3.5 w-3.5 mr-1" />
                                        Tree
                                    </Button>
                                    <Button
                                        variant={activeTab === 'code' ? 'secondary' : 'ghost'}
                                        size="sm"
                                        onClick={() => setActiveTab('code')}
                                        className="h-7 text-xs px-2.5 font-medium"
                                    >
                                        <Code className="h-3.5 w-3.5 mr-1" />
                                        Editor
                                    </Button>
                                </div>

                                <Button
                                    onClick={handleLoadSample}
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5 h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
                                    title="Load sample JSON tree"
                                >
                                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                                    <span>Load Sample</span>
                                </Button>

                                <Button
                                    onClick={handleBeautify}
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5 h-8 text-xs font-medium"
                                    title="Beautify JSON"
                                    disabled={!parsedData}
                                >
                                    <Wand2 className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Format</span>
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

                    {/* Main Workspace Panels */}
                    <div className={`grid gap-6 ${isFullscreen ? 'flex-1 min-h-0' : 'h-[680px]'} ${
                        activeTab === 'both' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'
                    }`}>
                        {/* Left / Code Panel */}
                        {(activeTab === 'both' || activeTab === 'code') && (
                            <Card className={`flex flex-col border-2 overflow-hidden shadow-xs ${
                                activeTab === 'both' ? 'lg:col-span-5' : 'h-full'
                            } ${parseError ? 'border-rose-300 dark:border-rose-900' : 'border-border'}`}>
                                <div className="p-3 bg-muted/40 border-b flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileJson className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-medium">Source JSON</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
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
                                            onClick={handleCopyRaw}
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                                            title="Copy Raw JSON"
                                        >
                                            {copiedRaw ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                            <span className="hidden sm:inline">{copiedRaw ? 'Copied' : 'Copy'}</span>
                                        </Button>
                                        <Button
                                            onClick={handleDownload}
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                            title="Download JSON"
                                        >
                                            <Download className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            onClick={() => setRawJson('')}
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                            title="Clear"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex-1 min-h-0 relative">
                                    <Editor
                                        height="100%"
                                        language="json"
                                        theme={editorTheme}
                                        value={rawJson}
                                        onChange={(val) => setRawJson(val || '')}
                                        options={{
                                            minimap: { enabled: false },
                                            fontSize: 13,
                                            tabSize: 2,
                                            scrollBeyondLastLine: false,
                                            automaticLayout: true,
                                            formatOnPaste: true,
                                            wordWrap: 'on'
                                        }}
                                    />
                                </div>

                                {parseError && (
                                    <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border-t border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        <span className="truncate font-mono">{parseError}</span>
                                    </div>
                                )}
                            </Card>
                        )}

                        {/* Right / Interactive Tree Panel */}
                        {(activeTab === 'both' || activeTab === 'tree') && (
                            <Card className={`flex flex-col border-2 border-border overflow-hidden shadow-xs ${
                                activeTab === 'both' ? 'lg:col-span-7' : 'h-full'
                            }`}>
                                {/* Tree Toolbar */}
                                <div className="p-3 bg-muted/40 border-b flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                                    {/* Search / Filter input */}
                                    <div className="relative flex-1 max-w-sm">
                                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder="Search keys or values..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-8 pr-3 py-1 text-xs rounded-md border border-input bg-background focus:outline-hidden focus:ring-1 focus:ring-primary"
                                        />
                                    </div>

                                    {/* Tree Expand/Collapse controls */}
                                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                        <Button
                                            onClick={handleExpandAll}
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-xs px-2"
                                            title="Expand All Nodes"
                                        >
                                            Expand All
                                        </Button>
                                        <Button
                                            onClick={handleCollapseAll}
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-xs px-2"
                                            title="Collapse All Nodes"
                                        >
                                            Collapse All
                                        </Button>

                                        {/* Depth controls */}
                                        <div className="hidden xl:flex items-center gap-1 border-l pl-2 ml-1 text-xs text-muted-foreground">
                                            <span>Depth:</span>
                                            {[1, 2, 3].map((d) => (
                                                <button
                                                    key={d}
                                                    onClick={() => handleCollapseToDepth(d)}
                                                    className="w-5 h-5 rounded border hover:bg-muted text-[10px] font-mono text-center"
                                                >
                                                    {d}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Tree Content Area */}
                                <div className="flex-1 min-h-0 overflow-auto p-4 bg-background/50">
                                    {parsedData ? (
                                        <div className="space-y-1">
                                            <TreeNode
                                                nodeKey="$"
                                                value={parsedData}
                                                path="$"
                                                searchQuery={searchQuery}
                                                collapsedPaths={collapsedPaths}
                                                toggleCollapse={toggleCollapse}
                                                onCopyPath={handleCopyPath}
                                                onCopyValue={handleCopyValue}
                                                copiedPath={copiedPath}
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
                                            <ListTree className="h-10 w-10 text-muted-foreground/40 mb-3" />
                                            <p className="text-sm font-medium">No valid JSON to visualize</p>
                                            <p className="text-xs text-muted-foreground/70 max-w-sm mt-1">
                                                Paste or upload standard JSON on the left editor to inspect its interactive tree structure.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )}
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
