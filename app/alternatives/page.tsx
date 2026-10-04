import type { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Shield, Zap, Sparkles } from 'lucide-react';
import { competitorsData } from '@/lib/alternatives-data';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://privacyfirst.tools';

export const metadata: Metadata = {
  title: 'Free & Private Alternatives to Popular Online Converters | Privacy-First',
  description:
    'Compare 100% private browser-based alternatives to iLovePDF, Smallpdf, CloudConvert, and TinyPNG. Zero file uploads, unlimited usage, and complete confidentiality.',
  alternates: {
    canonical: '/alternatives',
  },
  openGraph: {
    title: 'Free & Private Alternatives to Popular Online Converters',
    description:
      'Compare 100% private browser-based alternatives to iLovePDF, Smallpdf, CloudConvert, and TinyPNG.',
    type: 'website',
    url: `${BASE_URL}/alternatives`,
    siteName: 'Privacy-First Toolbox',
  },
};

export default function AlternativesIndexPage() {
  const competitors = Object.values(competitorsData);

  return (
    <div className="min-h-screen bg-background pb-20">
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
            <span className="text-sm font-medium text-foreground">Alternatives</span>
          </nav>

          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Competitor Comparison Guides</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-balance">
              Private Alternatives to Cloud Converters
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed text-balance">
              Most online conversion utilities upload your sensitive documents, contracts, and images to remote cloud servers. Discover how Privacy-First Toolbox provides faster, unlimited, and 100% private alternatives that process files entirely on your device.
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2">
          {competitors.map((comp) => (
            <Link key={comp.slug} href={`/alternatives/${comp.slug}`} className="group flex flex-col">
              <Card className="p-6 h-full transition-all duration-300 hover:shadow-xl hover:border-primary/40 flex flex-col justify-between group-hover:bg-muted/30">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      {comp.category}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      100% Local
                    </Badge>
                  </div>

                  <h2 className="text-xl font-bold group-hover:text-primary transition-colors">
                    Best {comp.name} Alternative
                  </h2>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {comp.metaDescription}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-primary">
                  <span>Read comparison & features</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
