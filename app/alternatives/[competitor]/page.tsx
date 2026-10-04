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

import { competitorsData } from '@/lib/alternatives-data';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://privacyfirst.tools';

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
