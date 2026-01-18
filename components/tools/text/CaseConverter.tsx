'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ToolHeader } from '../ToolHeader';
import { FileUploader } from '../FileUploader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  RotateCcw, 
  Download,
  Type,
  FileText,
  Lightbulb,
  HelpCircle,
  CaseSensitive,
  ALargeSmall,
  Baseline,
  CaseLower,
  CaseUpper,
  Trash2,
  List
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface CaseConverterProps {
  title: string;
  description: string;
  acceptedFormats: string[];
  maxFileSize: number;
  features?: string[];
  useCases?: string[];
  faq?: { question: string; answer: string }[];
}

export function CaseConverter({
  title,
  description,
  acceptedFormats,
  maxFileSize,
  features = [],
  useCases = [],
  faq = [],
}: CaseConverterProps) {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Handle File Upload
  const handleFileSelect = useCallback(async (selectedFile: File) => {
    try {
      const content = await selectedFile.text();
      setText(content);
      setFile(selectedFile);
    } catch (err) {
      console.error('Failed to read file', err);
      showMessage('Error reading file');
    }
  }, []);

  const handleTextInputSelect = useCallback(() => {
    setFile(new File([''], 'New Document.txt', { type: 'text/plain' }));
    setText('');
  }, []);

  const handleReset = useCallback(() => {
    setFile(null);
    setText('');
    setMessage(null);
  }, []);

  // Conversion Logic
  const toUpperCase = () => setText(text.toUpperCase());
  const toLowerCase = () => setText(text.toLowerCase());
  
  const toSentenceCase = () => {
    const result = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase());
    setText(result);
  };
  
  const toTitleCase = () => {
    const smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;
    const result = text.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, (match, index, title) => {
      if (index > 0 && index + match.length !== title.length &&
        match.search(smallWords) > -1 && title.charAt(index - 2) !== ":" &&
        (title.charAt(index + match.length) !== '-' || title.charAt(index - 1) === '-') &&
        title.charAt(index - 1).search(/[^\s-]/) < 0) {
        return match.toLowerCase();
      }
      if (match.substr(1).search(/[A-Z]|\../) > -1) {
        return match;
      }
      return match.charAt(0).toUpperCase() + match.substr(1);
    });
    setText(result);
  };

  const toCamelCase = () => {
    const result = text
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '')
      .replace(/[^a-zA-Z0-9]/g, '');
    setText(result);
  };
  
  const toPascalCase = () => {
    const result = text
      .replace(/\w+/g, function(w){return w[0].toUpperCase() + w.slice(1).toLowerCase();})
      .replace(/\s+/g, '')
      .replace(/[^a-zA-Z0-9]/g, '');
    setText(result);
  };
  
  const toSnakeCase = () => {
    const result = text
      .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
      ?.map(x => x.toLowerCase())
      .join('_') || text;
    setText(result);
  };
  
  const toKebabCase = () => {
    const result = text
      .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
      ?.map(x => x.toLowerCase())
      .join('-') || text;
    setText(result);
  };

  const toAlternatingCase = () => {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (/[a-zA-Z]/.test(char)) {
             result += i % 2 === 0 ? char.toLowerCase() : char.toUpperCase();
        } else {
            result += char;
        }
    }
    setText(result);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showMessage("Copied to clipboard!");
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleClear = () => {
    if (text.length > 0 && confirm('Are you sure you want to clear the text?')) {
      setText('');
      showMessage("Text cleared");
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "converted-text.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showMessage("Download started");
  };

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Tool Header */}
      <ToolHeader title={title} description={description} />

      {/* Main Content */}
      <main className="flex-1 mx-auto max-w-4xl px-4 py-8 sm:px-6 w-full space-y-12">
        
        {/* Input Method Selection or Editor */}
        {!file ? (
            <div className="min-h-[400px]">
                <Tabs defaultValue="text" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8 max-w-[400px] mx-auto">
                        <TabsTrigger value="text" className="gap-2">
                            <Type className="h-4 w-4" />
                            Type Text
                        </TabsTrigger>
                        <TabsTrigger value="file" className="gap-2">
                            <FileText className="h-4 w-4" />
                            Upload File
                        </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="text" className="mt-0">
                         <Card className="p-12 text-center border-2 border-dashed flex flex-col items-center justify-center gap-6 min-h-[300px]">
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold">Start Typing</h3>
                                <p className="text-muted-foreground max-w-md mx-auto">
                                    Type or paste your text to convert it instantly.
                                </p>
                            </div>
                            <Button size="lg" onClick={handleTextInputSelect} className="gap-2">
                                <Type className="h-4 w-4" />
                                Open Text Editor
                            </Button>
                         </Card>
                    </TabsContent>
                    
                    <TabsContent value="file" className="mt-0">
                        <FileUploader
                            acceptedFormats={acceptedFormats}
                            maxFileSize={maxFileSize}
                            onFileSelect={handleFileSelect}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        ) : (
            <div className="space-y-6">
                {/* Editor Container */}
                <div className="grid lg:grid-cols-[1fr_260px] gap-6">
                    
                    {/* Main Editor */}
                    <div className="space-y-4">
                         <Card className="relative flex flex-col min-h-[600px] border-2 focus-within:border-primary/50 transition-colors shadow-sm">
                            <div className="absolute top-3 right-3 flex gap-2 z-10">
                                <Button size="sm" variant="ghost" onClick={handleCopy} className="h-8 gap-2 hover:bg-muted">
                                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    <span className="sr-only sm:not-sr-only">{copied ? 'Copied' : 'Copy'}</span>
                                </Button>
                                <Button size="sm" variant="ghost" onClick={handleClear} className="h-8 text-muted-foreground hover:text-destructive transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Type or paste your text here..."
                                className="flex-1 w-full bg-transparent p-6 pt-14 resize-none focus:outline-none font-mono text-base leading-relaxed"
                                spellCheck="false"
                            />
                            
                            {/* Status Bar */}
                            <div className="border-t p-3 bg-muted/20 text-xs text-muted-foreground flex justify-between items-center rounded-b-lg">
                                <div className="flex gap-4">
                                    <span>{text.length} chars</span>
                                    <span>{text.trim() ? text.trim().split(/\s+/).length : 0} words</span>
                                </div>
                                {message && (
                                    <div className="text-primary font-medium animate-in fade-in slide-in-from-bottom-1 transition-all">
                                        {message}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar Controls */}
                    <div className="space-y-6">
                        {/* Standard Operations */}
                        <div className="space-y-2">
                             <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider px-1">Standard</h3>
                             <div className="grid grid-cols-1 gap-2">
                                <Button variant="outline" onClick={toUpperCase} className="justify-start h-10 px-4 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all group">
                                    <CaseUpper className="h-4 w-4 mr-3 text-muted-foreground group-hover:text-primary" /> 
                                    <span>UPPERCASE</span>
                                </Button>
                                <Button variant="outline" onClick={toLowerCase} className="justify-start h-10 px-4 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all group">
                                    <CaseLower className="h-4 w-4 mr-3 text-muted-foreground group-hover:text-primary" />
                                    <span>lowercase</span>
                                </Button>
                                <Button variant="outline" onClick={toTitleCase} className="justify-start h-10 px-4 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all group">
                                    <Baseline className="h-4 w-4 mr-3 text-muted-foreground group-hover:text-primary" />
                                    <span>Title Case</span>
                                </Button>
                                <Button variant="outline" onClick={toSentenceCase} className="justify-start h-10 px-4 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all group">
                                    <ALargeSmall className="h-4 w-4 mr-3 text-muted-foreground group-hover:text-primary" />
                                    <span>Sentence case</span>
                                </Button>
                             </div>
                        </div>

                        {/* Coding Styles */}
                        <div className="space-y-2">
                             <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider px-1">Code</h3>
                             <div className="grid grid-cols-1 gap-2">
                                <Button variant="outline" onClick={toCamelCase} className="justify-start h-10 px-4 font-mono text-sm hover:border-blue-500/50 hover:bg-blue-500/5 hover:text-blue-600 transition-all">
                                    camelCase
                                </Button>
                                <Button variant="outline" onClick={toPascalCase} className="justify-start h-10 px-4 font-mono text-sm hover:border-blue-500/50 hover:bg-blue-500/5 hover:text-blue-600 transition-all">
                                    PascalCase
                                </Button>
                                <Button variant="outline" onClick={toSnakeCase} className="justify-start h-10 px-4 font-mono text-sm hover:border-blue-500/50 hover:bg-blue-500/5 hover:text-blue-600 transition-all">
                                    snake_case
                                </Button>
                                <Button variant="outline" onClick={toKebabCase} className="justify-start h-10 px-4 font-mono text-sm hover:border-blue-500/50 hover:bg-blue-500/5 hover:text-blue-600 transition-all">
                                    kebab-case
                                </Button>
                             </div>
                        </div>

                         {/* Fun/Misc */}
                         <div className="space-y-2">
                             <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider px-1">Misc</h3>
                             <div className="grid grid-cols-1 gap-2">
                                <Button variant="outline" onClick={toAlternatingCase} className="justify-start h-10 px-4 hover:border-purple-500/50 hover:bg-purple-500/5 hover:text-purple-600 transition-all">
                                    <CaseSensitive className="h-4 w-4 mr-3" />
                                    aLtErNaTiNg
                                </Button>
                             </div>
                        </div>

                        {/* File Ops */}
                         <div className="pt-4 border-t space-y-2">
                            <Button className="w-full" onClick={handleDownload}>
                                <Download className="h-4 w-4 mr-2" /> Download File
                            </Button>
                            <Button variant="ghost" className="w-full text-muted-foreground" onClick={handleReset}>
                                <RotateCcw className="h-4 w-4 mr-2" /> Start Over
                            </Button>
                        </div>

                    </div>
                </div>
            </div>
        )}

        {/* SEO Content Sections */}
        {((features && features.length > 0) || (useCases && useCases.length > 0) || (faq && faq.length > 0)) && (
          <div className="grid gap-12 pt-8 border-t">
            {/* Features & Use Cases Grid */}
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

            {/* FAQ Section */}
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

      {/* Privacy Footer */}
      <footer className="border-t mt-auto py-8 bg-muted/10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <span className="text-2xl">🔒</span>
            <div>
              <h3 className="font-medium text-foreground">100% Privacy Guarantee</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
                This tool processes files entirely in your browser using secure web technologies. 
                Your files never leave your device and are never uploaded to any server.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
