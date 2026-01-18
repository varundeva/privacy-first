'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToolHeader } from '../ToolHeader';
import { FileUploader } from '../FileUploader';
import { 
  RotateCcw, 
  FileText, 
  AlignLeft, 
  Type, 
  Clock,
  Copy,
  Check,
  ArrowLeft,
  Lightbulb,
  HelpCircle
} from 'lucide-react';
import { formatFileSize } from '@/lib/workers/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface WordCounterProps {
  title: string;
  description: string;
  acceptedFormats: string[];
  maxFileSize: number;
  features?: string[];
  useCases?: string[];
  faq?: { question: string; answer: string }[];
}

interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTime: string;
}

export function WordCounter({
  title,
  description,
  acceptedFormats,
  maxFileSize,
  features = [],
  useCases = [],
  faq = [],
}: WordCounterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [stats, setStats] = useState<TextStats>({
    words: 0,
    characters: 0,
    charactersNoSpaces: 0,
    sentences: 0,
    paragraphs: 0,
    readingTime: '0 min',
  });

  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
  }, []);

  const handleTextInputSelect = useCallback(() => {
    // Create a generic empty text file for text input mode
    const newFile = new File([''], 'New Document.txt', { type: 'text/plain' });
    setFile(newFile);
  }, []);

  const handleReset = useCallback(() => {
    setFile(null);
    setText('');
    setStats({
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      readingTime: '0 min',
    });
  }, []);

  useEffect(() => {
    if (!file) return;
    
    // Only read file if it's not the dummy "New Document.txt" (which starts empty)
    // OR if we want to reset text when a new actual file is uploaded
    const readFile = async () => {
      try {
        // If it's a legitimate file select (not the dummy text input one), read it
        if (file.size > 0 || file.name !== 'New Document.txt') {
            setLoading(true);
            const textContent = await file.text();
            setText(textContent);
            calculateStats(textContent);
            setLoading(false);
        } else {
            // It's the dummy file, ensure text is empty or kept if logic dictates
            // For now, simple reset to empty if it's a new "Text Input" session
            setText('');
            calculateStats('');
        }
      } catch (err) {
        setError('Failed to read file content.');
        setLoading(false);
        console.error(err);
      }
    };

    readFile();
  }, [file]);

  const calculateStats = (content: string) => {
    // Word count
    const words = content.trim() === '' ? 0 : content.trim().split(/\s+/).length;
    
    // Character count
    const characters = content.length;
    
    // Characters without spaces
    const charactersNoSpaces = content.replace(/\s/g, '').length;
    
    // Sentence count (approximate)
    const sentences = content.trim() === '' ? 0 : content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    
    // Paragraph count
    const paragraphs = content.trim() === '' ? 0 : content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    
    // Reading time (200 wpm)
    const readingTimeMin = Math.ceil(words / 200);
    const readingTime = readingTimeMin <= 1 ? '< 1 min' : `~${readingTimeMin} min`;

    setStats({
      words,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      readingTime,
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Tool Header */}
      <ToolHeader title={title} description={description} />

      {/* Main Content */}
      <main className="flex-1 mx-auto max-w-4xl px-4 py-8 sm:px-6 w-full space-y-16">
        {/* Tool Interface */}
        <div className="min-h-[400px]">
          {!file ? (
            <Tabs defaultValue="file" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 max-w-[400px] mx-auto">
                  <TabsTrigger value="file" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Upload File
                  </TabsTrigger>
                  <TabsTrigger value="text" className="gap-2">
                    <Type className="h-4 w-4" />
                    Type Text
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="file" className="mt-0">
                  <FileUploader
                    acceptedFormats={acceptedFormats}
                    maxFileSize={maxFileSize}
                    onFileSelect={handleFileSelect}
                  />
                </TabsContent>
                
                <TabsContent value="text" className="mt-0">
                  <Card className="p-12 text-center border-2 border-dashed flex flex-col items-center justify-center gap-6 min-h-[300px]">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">Start Writing</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Type or paste your text directly in the browser. 
                        No file upload required.
                      </p>
                    </div>
                    <Button size="lg" onClick={handleTextInputSelect} className="gap-2">
                      <Type className="h-4 w-4" />
                      Open Text Editor
                    </Button>
                  </Card>
                </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <StatCard 
                    icon={<FileText className="h-5 w-5 text-blue-500" />}
                    label="Words"
                    value={stats.words.toLocaleString()}
                    />
                    <StatCard 
                    icon={<Type className="h-5 w-5 text-purple-500" />}
                    label="Characters"
                    value={stats.characters.toLocaleString()}
                    subValue={`${stats.charactersNoSpaces.toLocaleString()} no spaces`}
                    />
                    <StatCard 
                    icon={<AlignLeft className="h-5 w-5 text-green-500" />}
                    label="Sentences"
                    value={stats.sentences.toLocaleString()}
                    />
                    <StatCard 
                    icon={<AlignLeft className="h-5 w-5 text-orange-500" />}
                    label="Paragraphs"
                    value={stats.paragraphs.toLocaleString()}
                    />
                    <StatCard 
                    icon={<Clock className="h-5 w-5 text-red-500" />}
                    label="Reading Time"
                    value={stats.readingTime}
                    />
                    <StatCard 
                    icon={<FileText className="h-5 w-5 text-gray-500" />}
                    label="File Size"
                    value={formatFileSize(file.size)}
                    />
                </div>

                {/* File Content / Text Editor */}
                <Card className="flex flex-col overflow-hidden">
                    <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                        {file.name === 'New Document.txt' ? 'Text Editor' : `File Content: ${file.name}`}
                        </span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 gap-2" onClick={handleCopy}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied ? 'Copied' : 'Copy Text'}
                    </Button>
                    </div>
                    <div className="p-0">
                    <textarea 
                        className="w-full min-h-[400px] p-4 bg-background font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/20"
                        value={text}
                        onChange={(e) => {
                        const newText = e.target.value;
                        setText(newText);
                        calculateStats(newText);
                        }}
                        placeholder="Start typing or paste your text here..."
                    />
                    </div>
                </Card>

                <div className="flex justify-center pt-4">
                    <Button variant="outline" onClick={handleReset} className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Analyze Another File
                    </Button>
                </div>
            </div>
          )}
        </div>

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

function StatCard({ icon, label, value, subValue }: { icon: React.ReactNode, label: string, value: string | number, subValue?: string }) {
  return (
    <Card className="p-4 flex flex-col gap-2 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {subValue && <div className="text-xs text-muted-foreground">{subValue}</div>}
    </Card>
  );
}
