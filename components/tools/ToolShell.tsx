'use client';

import React, { useState, useCallback } from 'react';
import { ToolHeader } from './ToolHeader';
import { FileUploader } from './FileUploader';
import { Check, Lightbulb, HelpCircle } from 'lucide-react';
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
  category?: string;
  categoryLabel?: string;
  children: (props: { file: File; onReset: () => void }) => React.ReactNode;
}

/**
 * ToolShell - Container component for file-based tools
 */
export function ToolShell({
  title,
  description,
  acceptedFormats,
  maxFileSize,
  features = [],
  useCases = [],
  faq = [],
  category,
  categoryLabel,
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
    <div className="flex flex-col">
      {/* Tool Header */}
      <ToolHeader
        title={title}
        description={description}
        category={category}
        categoryLabel={categoryLabel}
      />

      {/* Main Content */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 w-full space-y-16">
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
      </div>

      {/* Privacy Guarantee Banner (simplified) */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 w-full text-center border-t border-dashed mt-8">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-muted/50 text-sm text-muted-foreground">
          <span>🔒</span>
          <span>100% Client-Side: Your files never leave your device.</span>
        </div>
      </div>
    </div>
  );
}
