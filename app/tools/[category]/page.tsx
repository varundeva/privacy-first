import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { toolCategories, getToolsByCategory, getCategoryById, ToolCategoryId } from '@/lib/tools-config';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Shield, Zap, Lock, Sparkles, CheckCircle2, ChevronRight, HelpCircle, ChevronDown } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://privacyfirst.tools';

const categoryFaqs: Record<string, { question: string; answer: string }[]> = {
  image: [
    {
      question: 'Is it safe to convert and resize sensitive photos here?',
      answer: 'Yes, 100%. All image conversions and resizes happen directly inside your web browser using HTML5 Canvas and WebAssembly. Your photos are never sent over the internet or stored on any server.',
    },
    {
      question: 'Does client-side image conversion reduce image quality?',
      answer: 'No. Conversions between formats like PNG to WebP or JPG to PNG use lossless compression algorithms or customizable high-quality settings, preserving maximum visual fidelity without cloud compression artifacts.',
    },
    {
      question: 'What image formats can I convert and optimize?',
      answer: 'You can convert, resize, and optimize JPG, JPEG, PNG, WebP, GIF, SVG, BMP, and ICO formats instantly.',
    },
  ],
  pdf: [
    {
      question: 'Can I merge and split sensitive legal or financial PDFs safely?',
      answer: 'Yes. Unlike typical PDF converters that upload your documents to remote cloud storage, our PDF tools process your files directly in local memory with WebAssembly. No third party ever has access to your confidential information.',
    },
    {
      question: 'Are there file size or daily page limits on PDF tools?',
      answer: 'No. Because your device handles the processing locally, you are not subject to daily limits, wait times, paywalls, or forced watermarks.',
    },
    {
      question: 'How fast is browser-based PDF compression and conversion?',
      answer: 'Processing speed is instantaneous or limited only by your computer’s CPU, with zero time wasted waiting for uploads or cloud download queues.',
    },
  ],
  text: [
    {
      question: 'Does the word counter or text diff tool store my text?',
      answer: 'Zero bytes of text are stored or transmitted. You can paste sensitive documents, proprietary code snippets, or confidential memos with absolute security.',
    },
    {
      question: 'Can I use these text tools without an active internet connection?',
      answer: 'Yes! Once the page is loaded into your browser, all text transformations, slug generation, line deduplication, and diff comparisons work completely offline.',
    },
  ],
  json: [
    {
      question: 'Can I safely format JSON payloads containing API keys or secrets?',
      answer: 'Yes. Your JSON data never leaves your browser. It is processed in pure JavaScript, making it safe for production secrets, authentication tokens, and private database dumps.',
    },
    {
      question: 'What JSON transformations are supported?',
      answer: 'You can beautify and minify JSON, compare JSON diffs, convert between JSON and CSV, transform JSON into TypeScript interfaces, and convert between YAML and JSON.',
    },
  ],
  crypto: [
    {
      question: 'Are cryptographic hashes computed on my device or on a server?',
      answer: 'All hashes (MD5, SHA-1, SHA-256, SHA-512, Bcrypt) and AES encryptions are calculated directly in your browser using the native Web Cryptography API and client-side libraries.',
    },
    {
      question: 'Can anyone intercept the text I am hashing or encrypting?',
      answer: 'No. Because no network requests are dispatched, nothing travels across the wire, completely eliminating man-in-the-middle risks.',
    },
  ],
  date: [
    {
      question: 'Does the Unix timestamp converter support millisecond and microsecond timestamps?',
      answer: 'Yes. It automatically detects and converts standard 10-digit second timestamps and 13-digit millisecond timestamps across all global timezones.',
    },
    {
      question: 'How are business days and time differences calculated?',
      answer: 'Calculations run accurately in your browser taking into account leap years, timezone offsets, and custom weekend configurations.',
    },
  ],
  web: [
    {
      question: 'Are code formatters (SQL, HTML, CSS) safe for proprietary source code?',
      answer: 'Yes. All parsing, indentation, and formatting logic runs locally inside your browser window. Zero code is sent to any server.',
    },
    {
      question: 'Do web utilities support offline debugging?',
      answer: 'Yes. URL parsers, User-Agent analyzers, HTML entity encoders, and CSS unit converters execute fully offline in your browser.',
    },
  ],
};

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateStaticParams() {
  return toolCategories.map((cat) => ({
    category: cat.id,
  }));
}

export async function generateMetadata(props: CategoryPageProps): Promise<Metadata> {
  const params = await props.params;
  const category = getCategoryById(params.category as ToolCategoryId);

  if (!category) {
    return {
      title: 'Category Not Found',
      description: 'The requested tool category does not exist.',
    };
  }

  const title = `Free ${category.label} - 100% Private Online Utilities | No Upload Required`;
  const description = `Free browser-based ${category.label.toLowerCase()}. ${category.description}. Process files entirely on your device with zero cloud uploads and full data privacy.`;

  return {
    title,
    description,
    keywords: [
      category.label.toLowerCase(),
      `free ${category.label.toLowerCase()}`,
      `private ${category.label.toLowerCase()}`,
      'browser tools',
      'no upload tools',
      'offline tools',
      'client-side utilities',
    ].join(', '),
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${BASE_URL}/tools/${category.id}`,
      siteName: 'Privacy-First Toolbox',
      images: [
        {
          url: `${BASE_URL}/api/og?title=${encodeURIComponent(category.label)}&description=${encodeURIComponent(category.description)}&category=${category.id}`,
          width: 1200,
          height: 630,
          alt: category.label,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${BASE_URL}/api/og?title=${encodeURIComponent(category.label)}&description=${encodeURIComponent(category.description)}&category=${category.id}`],
    },
    alternates: {
      canonical: `/tools/${category.id}`,
    },
  };
}

export default async function CategoryPage(props: CategoryPageProps) {
  const params = await props.params;
  const categoryId = params.category as ToolCategoryId;
  const category = getCategoryById(categoryId);

  if (!category) {
    notFound();
  }

  const tools = getToolsByCategory(categoryId);
  const otherCategories = toolCategories.filter((c) => c.id !== categoryId);
  const faqs = categoryFaqs[categoryId] || [];

  // Breadcrumb schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'All Tools',
        item: `${BASE_URL}/tools`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: category.label,
        item: `${BASE_URL}/tools/${category.id}`,
      },
    ],
  };

  // ItemList schema
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${category.label} Collection`,
    description: category.description,
    numberOfItems: tools.length,
    itemListElement: tools.map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: tool.name,
      description: tool.description,
      url: `${BASE_URL}/tools/${tool.category}/${tool.slug}`,
    })),
  };

  // FAQPage schema
  const faqSchema = faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  } : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <div className="min-h-screen bg-background pb-20">
        {/* Category Header */}
        <section className="border-b bg-gradient-to-b from-card to-background">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-2 mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
              <Link
                href="/tools"
                className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>All Tools</span>
              </Link>
              <span className="text-muted-foreground/60">/</span>
              <span className="font-medium text-foreground">{category.label}</span>
            </nav>

            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{tools.length} Free Client-Side Tools</span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-balance">
                Free {category.label}
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed text-balance">
                {category.description}. All processing occurs directly in your web browser using HTML5 Canvas, WebAssembly, and modern Web Workers. No files are uploaded to external servers.
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <Badge variant="outline" className="flex items-center gap-1.5 py-1 px-2.5 text-xs">
                  <Shield className="h-3.5 w-3.5 text-green-500" />
                  <span>100% Client-Side</span>
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1.5 py-1 px-2.5 text-xs">
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  <span>Instant Processing</span>
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1.5 py-1 px-2.5 text-xs">
                  <Lock className="h-3.5 w-3.5 text-blue-500" />
                  <span>Zero Server Uploads</span>
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Tools Grid */}
        <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Available {category.label}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Direct in-browser utilities</p>
            </div>
            <span className="text-xs sm:text-sm font-medium bg-muted px-3 py-1 rounded-full text-muted-foreground">
              {tools.length} utilities
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => {
              const IconComponent = (LucideIcons as any)[tool.icon] || LucideIcons.Settings;

              return (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.category}/${tool.slug}`}
                  className="group flex flex-col h-full"
                >
                  <Card className="p-6 h-full transition-all duration-300 hover:shadow-xl hover:border-primary/40 flex flex-col justify-between group-hover:bg-muted/40">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                          <IconComponent className="h-6 w-6" />
                        </div>
                        {tool.acceptedFormats.length > 0 && (
                          <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                            {tool.acceptedFormats.slice(0, 3).join(' ')}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-lg font-bold group-hover:text-primary transition-colors flex items-center gap-1.5">
                          {tool.name}
                          <ChevronRight className="h-4 w-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                          {tool.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-border/50 flex items-center justify-between text-xs text-primary font-medium">
                      <span>Open tool</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Educational SEO & Compliance Section */}
          <section className="mt-16 pt-12 border-t space-y-8">
            <div className="max-w-3xl space-y-3">
              <h2 className="text-2xl font-bold tracking-tight">
                Why Use Client-Side {category.label}?
              </h2>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                Most online conversion and manipulation websites upload your sensitive files directly to remote cloud servers. This exposes confidential company documents, legal contracts, medical forms, and private photos to third-party data breaches, surveillance, and corporate storage policies.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <Shield className="h-5 w-5" />
                  <h3 className="text-base font-semibold">100% Data Confidentiality</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your files remain inside your computer's RAM. They never transit across an external API, preventing any chance of interception or unauthorized storage.
                </p>
              </Card>

              <Card className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <Zap className="h-5 w-5" />
                  <h3 className="text-base font-semibold">Zero Bandwidth & Queue Delays</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Without upload or download wait times, large files process at native memory speed using multi-threaded Web Workers.
                </p>
              </Card>

              <Card className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <CheckCircle2 className="h-5 w-5" />
                  <h3 className="text-base font-semibold">Unlimited & No Paywalls</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  No subscription tiers, daily file limits, watermarks, or forced registrations. Complete freedom for professionals, students, and businesses.
                </p>
              </Card>
            </div>
          </section>

          {/* Category FAQ Section */}
          {faqs.length > 0 && (
            <section className="mt-16 pt-12 border-t space-y-8">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Frequently Asked Questions</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {category.label} FAQs
                </h2>
                <p className="text-sm text-muted-foreground">
                  Answers to common questions regarding local browser processing, quality, and security.
                </p>
              </div>

              <div className="max-w-3xl mx-auto space-y-4">
                {faqs.map((faq, index) => (
                  <details
                    key={index}
                    className="group rounded-xl border bg-card p-5 open:bg-muted/30 transition-colors"
                  >
                    <summary className="flex cursor-pointer items-center justify-between font-semibold text-foreground list-none">
                      <span className="text-base">{faq.question}</span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180 flex-shrink-0 ml-4" />
                    </summary>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* Explore Other Categories */}
          <section className="mt-16 pt-12 border-t">
            <h2 className="text-xl font-bold tracking-tight mb-6">Explore Other Tool Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {otherCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/tools/${cat.id}`}
                  className="p-4 rounded-xl border bg-card hover:bg-muted/50 hover:border-primary/30 transition-all text-center group"
                >
                  <span className="text-sm font-semibold group-hover:text-primary transition-colors block">
                    {cat.label}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
