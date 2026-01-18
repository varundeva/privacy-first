'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  RotateCcw, 
  FileText, 
  AlignLeft, 
  Type, 
  Clock,
  Copy,
  Check
} from 'lucide-react';
import { formatFileSize } from '@/lib/workers/types';

interface WordCounterProps {
  file: File;
  onReset: () => void;
}

interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTime: string;
}

export function WordCounter({ file, onReset }: WordCounterProps) {
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const readFile = async () => {
      try {
        setLoading(true);
        const textContent = await file.text();
        setText(textContent);
        calculateStats(textContent);
        setLoading(false);
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

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Reading file...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center border-destructive/50 bg-destructive/10">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={onReset} variant="outline">Try Again</Button>
      </Card>
    );
  }

  return (
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

      {/* File Content Preview */}
      <Card className="flex flex-col overflow-hidden">
        <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">File Content: {file.name}</span>
          </div>
          <Button variant="ghost" size="sm" className="h-8 gap-2" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy Text'}
          </Button>
        </div>
        <div className="p-4 max-h-[400px] overflow-y-auto bg-muted/10 font-mono text-sm whitespace-pre-wrap">
          {text}
        </div>
      </Card>

      <div className="flex justify-center pt-4">
        <Button variant="outline" onClick={onReset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Analyze Another File
        </Button>
      </div>
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
