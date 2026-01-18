'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { ToolHeader } from './ToolHeader';
import { FileUploader } from './FileUploader';
import { ArrowLeft, Check, Lightbulb, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';

interface ToolShellProps {
  title: string;
  description: string;
  acceptedFormats: string[];
  maxFileSize: number;
  features?: string[];
  useCases?: string[];
  faq?: { question: string; answer: string }[];
  children: (props: { file: File; onReset: () => void }) => React.ReactNode;
}

/**
 * ToolShell - Container component for all tools
 * 
 * Handles:
 * - File selection and validation
 * - Navigation back to home
 * - Consistent layout across all tools
 * - Displaying rich SEO content (Features, Use Cases, FAQ)
 * 
 * The tool-specific component receives the file and a reset callback
 */
export function ToolShell({
  title,
  description,
  acceptedFormats,
  maxFileSize,
  features = [],
  useCases = [],
  faq = [],
  children,
}: ToolShellProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
  }, []);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Tool Header */}
      <ToolHeader title={title} description={description} />

      {/* Main Content */}
      <main className="flex-1 mx-auto max-w-4xl px-4 py-8 sm:px-6 w-full space-y-16">
        {/* Tool Interface */}
        <div className="min-h-[400px]">
          {!selectedFile ? (
            <FileUploader
              acceptedFormats={acceptedFormats}
              maxFileSize={maxFileSize}
              onFileSelect={handleFileSelect}
            />
          ) : (
            children({ file: selectedFile, onReset: handleReset })
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
