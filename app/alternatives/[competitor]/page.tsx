import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Shield,
  Zap,
  Lock,
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  FileText,
  Image as ImageIcon,
  Cpu,
} from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://privacyfirst.tools';

export interface CompetitorData {
  slug: string;
  name: string;
  category: string;
  tagline: string;
  metaTitle: string;
  metaDescription: string;
  competitorPros: string[];
  competitorCons: string[];
  ourAdvantages: string[];
  comparisonRows: {
    feature: string;
    us: string | boolean;
    them: string | boolean;
    note?: string;
  }[];
  recommendedTools: {
    name: string;
    description: string;
    url: string;
    badge: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
}

export const competitorsData: Record<string, CompetitorData> = {
  ilovepdf: {
    slug: 'ilovepdf',
    name: 'iLovePDF',
    category: 'PDF Tools',
    tagline: 'The 100% Private, Client-Side Alternative to iLovePDF',
    metaTitle: 'Free iLovePDF Alternative - 100% Private PDF Tools | No Cloud Upload',
    metaDescription:
      'Looking for a secure iLovePDF alternative? Merge, split, compress, and convert PDFs directly in your browser. Zero cloud uploads, no daily limits, free forever.',
    competitorPros: [
      'Well-known brand with broad tool selection',
      'Mobile apps available',
      'Integration with Google Drive and Dropbox',
    ],
    competitorCons: [
      'Uploads all PDF files to third-party cloud servers',
      'Free tier restricts batch processing and file size',
      'Requires paid subscription ($7-$10/month) for unrestricted access',
      'Prohibited in security-conscious organizations, healthcare, and law firms',
    ],
    ourAdvantages: [
      '100% Client-Side: Files processed in browser memory via WebAssembly/pdf-lib',
      'Zero Cloud Uploads: Documents never touch any remote server',
      'No Daily Limits: Unlimited merges, splits, and compressions',
      'Completely Free: No paywalls, subscriptions, or hidden charges',
      'Offline Capability: Works without active internet once loaded',
    ],
    comparisonRows: [
      { feature: 'File Processing Location', us: 'Local Browser (Device)', them: 'Remote Cloud Servers' },
      { feature: 'Server File Upload', us: 'Never (0 bytes uploaded)', them: 'Always required' },
      { feature: 'Daily Free File Limit', us: 'Unlimited', them: 'Limited free tasks/day' },
      { feature: 'Price', us: 'Free Forever ($0)', them: 'Freemium ($7-$10/mo for Pro)' },
      { feature: 'Account Required', us: false, them: 'Required for advanced features' },
      { feature: 'Works Offline', us: true, them: false },
      { feature: 'GDPR / HIPAA Safe', us: true, them: 'Depends on corporate DPA' },
      { feature: 'Open Source Transparency', us: true, them: false },
    ],
    recommendedTools: [
      {
        name: 'PDF Compressor',
        description: 'Reduce PDF file size without sending confidential documents to a cloud server.',
        url: '/tools/pdf/pdf-compress',
        badge: 'High Value',
      },
      {
        name: 'PDF Merger',
        description: 'Combine multiple PDF files into a single document entirely on your computer.',
        url: '/tools/pdf/pdf-merge',
        badge: 'Popular',
      },
      {
        name: 'PDF Splitter',
        description: 'Extract specific pages or split multi-page documents instantly.',
        url: '/tools/pdf/pdf-split',
        badge: 'Fast',
      },
      {
        name: 'PDF to JPG / PNG',
        description: 'Rasterize PDF pages into high-resolution images client-side.',
        url: '/tools/pdf/pdf-to-png',
        badge: 'Utility',
      },
    ],
    faqs: [
      {
        question: 'Why choose Privacy-First Toolbox over iLovePDF?',
        answer:
          'iLovePDF requires uploading your files to remote servers to convert or merge them. Privacy-First Toolbox executes all PDF operations inside your browser sandbox using WebAssembly and pdf-lib. Your documents never transit across the internet, making it compliant with strict privacy requirements.',
      },
      {
        question: 'Is Privacy-First Toolbox truly free without daily limits?',
        answer:
          'Yes. Because computations run locally on your device rather than on expensive cloud servers, we have no cloud server costs per conversion. This allows us to offer unlimited usage without paywalls or subscriptions.',
      },
      {
        question: 'Can I use this for confidential legal or medical documents?',
        answer:
          'Yes. You can even disconnect your internet or enable airplane mode after loading the page, and the tools will continue working. Zero bytes of your document data leave your hardware.',
      },
    ],
  },
  smallpdf: {
    slug: 'smallpdf',
    name: 'Smallpdf',
    category: 'PDF Tools',
    tagline: 'Unlimited, Free, and Private Smallpdf Alternative',
    metaTitle: 'Best Smallpdf Alternative - Free, Unlimited & Private | No File Upload',
    metaDescription:
      'Tired of the Smallpdf 2-document daily limit? Privacy-First Toolbox offers unlimited PDF compression, conversion, and organization with zero server uploads.',
    competitorPros: [
      'Polished user interface',
      'Electronic signature features',
      'Desktop apps available for paying users',
    ],
    competitorCons: [
      'Strict 2-document per day free limit',
      'Expensive $12/month subscription',
      'Files uploaded and processed on remote cloud infrastructure',
      'Aggressive paywall modals and countdown timers',
    ],
    ourAdvantages: [
      'No 2-document limit: Process as many files as you need',
      'No credit card or subscription needed ($0 forever)',
      '100% private: Files stay on your machine',
      'Instant processing without cloud upload queue delays',
    ],
    comparisonRows: [
      { feature: 'Daily Free Document Limit', us: 'Unlimited', them: '2 documents per day' },
      { feature: 'Server File Storage', us: 'None (Device RAM only)', them: 'Cloud server storage' },
      { feature: 'Subscription Cost', us: '$0 / Free Forever', them: '$12 / month' },
      { feature: 'Sign-up or Email Wall', us: false, them: true },
      { feature: 'Speed', us: 'Instant (No upload time)', them: 'Dependent on upload speed' },
      { feature: 'Offline Operation', us: true, them: false },
      { feature: 'Open Source', us: true, them: false },
    ],
    recommendedTools: [
      {
        name: 'PDF Compressor',
        description: 'Compress large PDF files locally without hitting a 2-file daily limit.',
        url: '/tools/pdf/pdf-compress',
        badge: 'Most Popular',
      },
      {
        name: 'PDF Organize & Delete Pages',
        description: 'Reorder, rotate, or remove unwanted pages securely in your browser.',
        url: '/tools/pdf/pdf-organize',
        badge: 'Unlimited',
      },
      {
        name: 'Images to PDF Converter',
        description: 'Convert multiple photos into a consolidated PDF document with zero upload.',
        url: '/tools/pdf/images-to-pdf',
        badge: 'Private',
      },
      {
        name: 'PDF Watermark & Numbering',
        description: 'Add page numbers and confidential watermarks to your documents.',
        url: '/tools/pdf/pdf-page-numbers',
        badge: 'Security',
      },
    ],
    faqs: [
      {
        question: 'How does Privacy-First Toolbox compare to Smallpdf free tier?',
        answer:
          'Smallpdf restricts free visitors to 2 documents per 24-hour cycle before demanding a $12/month upgrade. Privacy-First Toolbox imposes zero daily limits, zero watermarks, and never asks for payment.',
      },
      {
        question: 'How can you offer this for free when Smallpdf charges $12/month?',
        answer:
          'Smallpdf maintains massive server farms to process and store files in the cloud. Privacy-First Toolbox uses modern browser technologies (WebAssembly and Web Workers) to process documents on your own hardware, eliminating server infrastructure overhead.',
      },
    ],
  },
  cloudconvert: {
    slug: 'cloudconvert',
    name: 'CloudConvert',
    category: 'File Converters',
    tagline: 'Instant Browser-Based Alternative to CloudConvert',
    metaTitle: 'CloudConvert Alternative - Fast Browser File Converter | No 25-File Limit',
    metaDescription:
      'Fast, private CloudConvert alternative. Convert images, PDFs, and data formats directly in your browser. No 25-conversion daily limit, no wait queues, 100% private.',
    competitorPros: [
      'Huge range of niche format converters',
      'API access for developers',
      'Custom conversion presets',
    ],
    competitorCons: [
      '25 conversions per day free limit',
      'Server conversion queues can take several minutes during peak traffic',
      'Files uploaded to external cloud servers',
      'Requires paid credits for larger files or batch conversions',
    ],
    ourAdvantages: [
      'Zero queue times: Processing begins instantaneously in browser',
      'No 25-file quota: Convert unlimited files',
      'Guaranteed confidentiality: Files never leave your local device',
      'Supports all major Web, Image, and PDF formats',
    ],
    comparisonRows: [
      { feature: 'Daily Conversion Quota', us: 'Unlimited', them: '25 conversion credits/day' },
      { feature: 'Queue Wait Times', us: '0 seconds (Instant)', them: 'Minutes during peak load' },
      { feature: 'Data Privacy', us: '100% Local (No Upload)', them: 'Uploaded to cloud servers' },
      { feature: 'Cost', us: '100% Free', them: 'Paid packages ($9+)' },
      { feature: 'Account Required', us: false, them: 'Required after free quota' },
      { feature: 'Works Offline', us: true, them: false },
    ],
    recommendedTools: [
      {
        name: 'Image Resizer & Scaler',
        description: 'Batch resize and scale images with pixel precision and social presets.',
        url: '/tools/image/image-resizer',
        badge: 'Top Tool',
      },
      {
        name: 'JPG to PNG Converter',
        description: 'Transform JPEG images to lossless transparent PNGs instantly.',
        url: '/tools/image/jpg-to-png',
        badge: 'Instant',
      },
      {
        name: 'WebP to JPG / PNG',
        description: 'Convert modern WebP images to widely compatible formats.',
        url: '/tools/image/webp-to-jpg',
        badge: 'Universal',
      },
      {
        name: 'SVG to PNG Rasterizer',
        description: 'Render vector SVG illustrations to high-DPI raster images.',
        url: '/tools/image/svg-to-png',
        badge: 'High DPI',
      },
    ],
    faqs: [
      {
        question: 'Why switch from CloudConvert to Privacy-First Toolbox?',
        answer:
          'CloudConvert forces users into wait queues and caps free daily usage at 25 credits. If you are converting images, PDFs, or code formats, Privacy-First Toolbox executes everything instantly on your machine with zero queues and zero file quotas.',
      },
      {
        question: 'Does local conversion reduce image quality compared to CloudConvert?',
        answer:
          'No. Our tools use standard browser canvas interpolation and lossless encoding libraries that provide pixel-identical results to server-side ImageMagick/libvips engines.',
      },
    ],
  },
  tinypng: {
    slug: 'tinypng',
    name: 'TinyPNG',
    category: 'Image Tools',
    tagline: 'Unlimited Image Compression Without Server Uploads',
    metaTitle: 'TinyPNG Alternative - Unlimited Image Compression | No Server Upload',
    metaDescription:
      'Compress images without uploading to TinyPNG servers. Unlimited batch compression, adjustable quality, support for WebP, PNG, and JPG. 100% private.',
    competitorPros: [
      'Pioneer in lossy PNG quantization',
      'Photoshop and WordPress plugins',
      'Simple drag-and-drop interface',
    ],
    competitorCons: [
      '5MB max file size limit on free tier',
      'Maximum 20 images in batch upload',
      'Images uploaded to Dutch/AWS cloud servers',
      'Annual Pro subscription for larger files',
    ],
    ourAdvantages: [
      'Up to 50MB file size support',
      'No 20-image batch cap',
      'Files never leave your local device',
      'Full control over compression quality and target formats (JPG, PNG, WebP)',
    ],
    comparisonRows: [
      { feature: 'Max File Size (Free)', us: '50MB', them: '5MB' },
      { feature: 'Batch Limit (Free)', us: 'Unlimited', them: '20 images' },
      { feature: 'Privacy & Security', us: '100% In-Browser', them: 'Uploaded to cloud' },
      { feature: 'Format Support', us: 'JPG, PNG, WebP, SVG, BMP', them: 'PNG, WebP, JPG' },
      { feature: 'Adjustable Quality', us: true, them: false },
      { feature: 'Works Offline', us: true, them: false },
    ],
    recommendedTools: [
      {
        name: 'Image Resizer & Optimizer',
        description: 'Resize dimensions and adjust compression quality with live size preview.',
        url: '/tools/image/image-resizer',
        badge: 'Recommended',
      },
      {
        name: 'PNG to WebP Converter',
        description: 'Compress heavy PNG assets into modern, lightweight WebP graphics.',
        url: '/tools/image/png-to-webp',
        badge: 'Modern Web',
      },
      {
        name: 'JPG to WebP Converter',
        description: 'Cut JPEG file sizes by 30-50% with next-gen WebP compression.',
        url: '/tools/image/jpg-to-webp',
        badge: 'Speed',
      },
    ],
    faqs: [
      {
        question: 'How is this different from TinyPNG?',
        answer:
          'TinyPNG uploads your photos to external servers to execute compression algorithms. Privacy-First Toolbox executes image compression directly in your browser using HTML5 Canvas and WebAssembly. Your photos never leave your device.',
      },
      {
        question: 'Can I compress files larger than 5MB?',
        answer:
          'Yes. Unlike TinyPNG which cuts off free users at 5MB, Privacy-First Toolbox allows up to 50MB per file because there are no server bandwidth constraints.',
      },
    ],
  },
};

interface PageProps {
  params: Promise<{
    competitor: string;
  }>;
}

export async function generateStaticParams() {
  return Object.keys(competitorsData).map((slug) => ({
    competitor: slug,
  }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const data = competitorsData[params.competitor];

  if (!data) {
    return {
      title: 'Alternative Not Found',
    };
  }

  return {
    title: data.metaTitle,
    description: data.metaDescription,
    keywords: [
      `${data.name.toLowerCase()} alternative`,
      `free ${data.name.toLowerCase()} alternative`,
      `private ${data.name.toLowerCase()} alternative`,
      `${data.name.toLowerCase()} no upload`,
      `${data.name.toLowerCase()} offline`,
      'secure online tools',
      'client-side converter',
    ].join(', '),
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      type: 'article',
      url: `${BASE_URL}/alternatives/${data.slug}`,
      siteName: 'Privacy-First Toolbox',
      images: [
        {
          url: `${BASE_URL}/api/og?title=${encodeURIComponent(`${data.name} Alternative`)}&description=${encodeURIComponent(data.tagline)}&category=web`,
          width: 1200,
          height: 630,
          alt: `${data.name} Alternative`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.metaTitle,
      description: data.metaDescription,
      images: [`${BASE_URL}/api/og?title=${encodeURIComponent(`${data.name} Alternative`)}&description=${encodeURIComponent(data.tagline)}&category=web`],
    },
    alternates: {
      canonical: `/alternatives/${data.slug}`,
    },
  };
}

export default async function AlternativePage(props: PageProps) {
  const params = await props.params;
  const data = competitorsData[params.competitor];

  if (!data) {
    notFound();
  }

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
        name: 'Alternatives',
        item: `${BASE_URL}/alternatives`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${data.name} Alternative`,
        item: `${BASE_URL}/alternatives/${data.slug}`,
      },
    ],
  };

  // FAQ schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="min-h-screen bg-background pb-20">
        {/* Header Hero */}
        <section className="border-b bg-gradient-to-b from-card to-background">
          <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-2 mb-6" aria-label="Breadcrumb">
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>All Tools</span>
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm text-muted-foreground">Alternatives</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm font-medium text-foreground">{data.name}</span>
            </nav>

            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Honest Competitor Comparison</span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-balance">
                The Best Private Alternative to {data.name}
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed text-balance">
                {data.tagline}. Why upload confidential documents and photos to {data.name}&apos;s cloud servers when you can process them 100% locally in your browser with zero limits?
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Badge variant="outline" className="flex items-center gap-1.5 py-1 px-2.5">
                  <Shield className="h-3.5 w-3.5 text-green-500" />
                  <span>100% Client-Side Processing</span>
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1.5 py-1 px-2.5">
                  <Lock className="h-3.5 w-3.5 text-blue-500" />
                  <span>Zero Cloud File Uploads</span>
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1.5 py-1 px-2.5">
                  <Zap className="h-3.5 w-3.5 text-amber-500" />
                  <span>Unlimited Free Usage</span>
                </Badge>
              </div>
            </div>
          </div>
        </section>

        <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
          {/* Comparison Matrix Table */}
          <section className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">
                Privacy-First Toolbox vs {data.name} At-A-Glance
              </h2>
              <p className="text-muted-foreground">
                Compare privacy, security architecture, daily quotas, and pricing.
              </p>
            </div>

            <Card className="overflow-hidden border shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/60 text-muted-foreground font-semibold border-b">
                    <tr>
                      <th className="py-4 px-6">Capability / Feature</th>
                      <th className="py-4 px-6 text-primary bg-primary/5 font-bold">
                        Privacy-First Toolbox
                      </th>
                      <th className="py-4 px-6">{data.name}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {data.comparisonRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-6 font-medium text-foreground">
                          {row.feature}
                        </td>
                        <td className="py-4 px-6 bg-primary/5 font-semibold text-primary">
                          {typeof row.us === 'boolean' ? (
                            row.us ? (
                              <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-bold">
                                <Check className="h-4 w-4" /> Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-red-500">
                                <X className="h-4 w-4" /> No
                              </span>
                            )
                          ) : (
                            row.us
                          )}
                        </td>
                        <td className="py-4 px-6 text-muted-foreground">
                          {typeof row.them === 'boolean' ? (
                            row.them ? (
                              <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                                <Check className="h-4 w-4" /> Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-red-500 font-medium">
                                <X className="h-4 w-4" /> No
                              </span>
                            )
                          ) : (
                            row.them
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </section>

          {/* Deep Dive Breakdown */}
          <section className="grid gap-8 md:grid-cols-2">
            <Card className="p-6 space-y-4 border-primary/30 bg-primary/5">
              <div className="flex items-center gap-2 text-primary font-bold text-lg">
                <Check className="h-5 w-5" />
                <h3>Why Switch to Privacy-First?</h3>
              </div>
              <ul className="space-y-3 text-sm">
                {data.ourAdvantages.map((adv, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2 font-bold text-lg text-muted-foreground">
                <HelpCircle className="h-5 w-5" />
                <h3>Where {data.name} Falls Short</h3>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {data.competitorCons.map((con, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-destructive flex-shrink-0" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </section>

          {/* Direct Replacement Tools */}
          <section className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">
                Recommended Free Replacements
              </h2>
              <p className="text-muted-foreground">
                Switch to these client-side utilities and stop uploading files today:
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {data.recommendedTools.map((tool, idx) => (
                <Link key={idx} href={tool.url} className="group">
                  <Card className="p-5 h-full transition-all duration-300 hover:shadow-lg hover:border-primary/40 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-base group-hover:text-primary transition-colors">
                          {tool.name}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {tool.badge}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                    <div className="pt-4 mt-3 flex items-center text-xs font-semibold text-primary gap-1">
                      <span>Launch free tool</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>

          {/* Frequently Asked Questions */}
          <section className="space-y-6 pt-8 border-t">
            <h2 className="text-2xl font-bold tracking-tight">Frequently Asked Questions</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {data.faqs.map((faq, idx) => (
                <Card key={idx} className="p-6 space-y-2">
                  <h3 className="font-semibold text-base">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                </Card>
              ))}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
