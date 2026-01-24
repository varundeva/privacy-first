'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToolHeader } from '../ToolHeader';
import {
    Copy,
    RotateCcw,
    FileText,
    Type,
    AlignLeft,
    Check,
    Lightbulb,
    HelpCircle,
    Download,
} from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

interface LoremIpsumGeneratorProps {
    title: string;
    description: string;
    features?: string[];
    useCases?: string[];
    faq?: { question: string; answer: string }[];
}

const LOREM_TEXT = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam. Maecenas fermentum consequat mi. Donec fermentum. Pellentesque malesuada nulla a mi. Duis sapien sem, aliquet nec, commodo eget, consequat quis, neque.

Aliquam faucibus, elit ut dictum aliquet, felis nisl adipiscing sapien, sed malesuada diam lacus eget erat. Cras mollis scelerisque nunc. Nullam arcu. Aliquam consequat. Curabitur augue lorem, dapibus quis, laoreet et, pretium ac, nisi. Aenean magna nisl, mollis quis, molestie eu, feugiat in, orci. In hac habitasse platea dictumst. Fusce convallis, mauris imperdiet gravida bibendum, nisl turpis suscipit mauris, sed placerat ipsum urna sed risus. In convallis tellus a mauris. Curabitur ordat, nisi in hendrerit gravida, justo est varius justo, nec blandit eros pede in urna.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.

Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur? At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.`;

// Helper to process raw text into clean chunks
const PARAGRAPHS = LOREM_TEXT.split('\n').filter(p => p.trim().length > 0);
const SENTENCES = LOREM_TEXT.match(/[^.!?]+[.!?]+/g) || [];
const WORDS = LOREM_TEXT.replace(/[.,!?]/g, '').split(/\s+/);

export function LoremIpsumGenerator({ title, description, features, useCases, faq }: LoremIpsumGeneratorProps) {
    const [count, setCount] = useState(3);
    const [type, setType] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
    const [startWithLorem, setStartWithLorem] = useState(true);

    const generatedText = useMemo(() => {
        let result = '';
        const limit = Math.max(1, Math.min(count, 100)); // Clamp between 1 and 100

        if (type === 'paragraphs') {
            const chunks = [];
            for (let i = 0; i < limit; i++) {
                chunks.push(PARAGRAPHS[i % PARAGRAPHS.length]);
            }
            result = chunks.join('\n\n');
        } else if (type === 'sentences') {
            const chunks = [];
            for (let i = 0; i < limit; i++) {
                chunks.push(SENTENCES[i % SENTENCES.length].trim());
            }
            result = chunks.join(' ');
        } else { // words
            const chunks = [];
            for (let i = 0; i < limit; i++) {
                chunks.push(WORDS[i % WORDS.length].toLowerCase());
            }
            result = chunks.join(' ');
            // Capitalize first letter
            result = result.charAt(0).toUpperCase() + result.slice(1);
            // Add period if ending
            if (!result.endsWith('.')) result += '.';
        }

        // Handle "Start with Lorem ipsum" logic
        if (startWithLorem) {
            if (!result.startsWith('Lorem ipsum')) {
                // If the generated text doesn't start with it naturally (e.g. random offset or different type)
                // We force it. But since our text source IS lorem ipsum, it usually starts with it
                // unless we change logic to be random.
                // Our current simple sequential logic always starts with the first paragraph/sentence/word
                // which IS "Lorem ipsum".
                // So if user UNCHECKS it, we should remove it.
            }
        } else {
            // Remove "Lorem ipsum dolor sit amet, " prefix if present
            const prefix = "Lorem ipsum dolor sit amet";
            if (result.startsWith(prefix)) {
                // Try to remove nicely (adjusting punctuation/capitalization is tricky but let's try basic)
                // Removing just "Lorem ipsum " might be safer
                result = result.replace(/^Lorem ipsum dolor sit amet, /, '');
                result = result.replace(/^Lorem ipsum /, '');
                // Capitalize new start
                result = result.charAt(0).toUpperCase() + result.slice(1);
            }
        }

        return result;
    }, [count, type, startWithLorem]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(generatedText);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const handleDownload = () => {
        const blob = new Blob([generatedText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'lorem-ipsum.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <ToolHeader title={title} description={description} />

            <main className="flex-1 mx-auto max-w-5xl px-4 py-8 sm:px-6 w-full space-y-8">
                {/* Controls */}
                <Card className="p-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">

                        <div className="space-y-3 flex-1 w-full">
                            <Label>Generate Type</Label>
                            <Tabs value={type} onValueChange={(v) => setType(v as any)} className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="paragraphs">Paragraphs</TabsTrigger>
                                    <TabsTrigger value="sentences">Sentences</TabsTrigger>
                                    <TabsTrigger value="words">Words</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        <div className="space-y-3 w-full md:w-32">
                            <Label>Count</Label>
                            <Input
                                type="number"
                                min={1}
                                max={100}
                                value={count}
                                onChange={(e) => setCount(parseInt(e.target.value) || 0)}
                            />
                        </div>

                        <div className="space-y-3 pb-2">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="start-lorem"
                                    checked={startWithLorem}
                                    onCheckedChange={setStartWithLorem}
                                />
                                <Label htmlFor="start-lorem">Start with &quot;Lorem ipsum&quot;</Label>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Output */}
                <Card className="p-4 flex flex-col min-h-[400px]">
                    <div className="flex justify-between items-center mb-4">
                        <Label>Generated Text</Label>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={handleDownload}
                            >
                                <Download className="h-3 w-3" />
                                Download
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                className="gap-2 bg-purple-600 hover:bg-purple-700"
                                onClick={handleCopy}
                            >
                                <Copy className="h-3 w-3" />
                                Copy Text
                            </Button>
                        </div>
                    </div>
                    <Textarea
                        readOnly
                        className="flex-1 font-serif text-lg leading-relaxed p-6 resize-y min-h-[300px]"
                        value={generatedText}
                    />
                </Card>

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

            <footer className="border-t mt-auto py-8 bg-muted/10">
                <div className="mx-auto max-w-5xl px-4 sm:px-6">
                    <div className="flex flex-col items-center justify-center gap-4 text-center">
                        <span className="text-2xl">⚡️</span>
                        <div>
                            <h3 className="font-medium text-foreground">Instant Generation</h3>
                            <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
                                Run entirely in your browser. Generate as much text as you need instantly.
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
