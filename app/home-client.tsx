'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toolsConfig, toolCategories, Tool } from '@/lib/tools-config';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Shield,
  Zap,
  Globe,
  Lock,
  ArrowRight,
  Image,
  FileText,
  Type,
  Video,
  Music,
  ChevronDown,
  X,
  Sparkles,
  Clock,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';

// ============================================
// Types
// ============================================

interface FilterState {
  search: string;
  category: string | null;
  inputFormat: string | null;
  outputFormat: string | null;
}

// ============================================
// Constants
// ============================================

const formatMetadata: Record<string, { label: string; icon?: string; color?: string }> = {
  jpg: { label: 'JPG/JPEG', icon: '📷', color: 'bg-amber-500' },
  png: { label: 'PNG', icon: '🖼️', color: 'bg-blue-500' },
  webp: { label: 'WebP', icon: '🌐', color: 'bg-green-500' },
  gif: { label: 'GIF', icon: '🎬' },
  bmp: { label: 'BMP', icon: '🗂️' },
  svg: { label: 'SVG', icon: '✏️' },
  ico: { label: 'ICO', icon: '⭐' },
  pdf: { label: 'PDF', icon: '📄', color: 'bg-red-500' },
};

function normalizeFormat(fmt: string): string {
  const f = fmt.replace(/^\./, '').toLowerCase();
  if (f === 'jpeg') return 'jpg';
  return f;
}

// Derive unique formats from tools config
const availableInputFormats = Array.from(new Set(
  toolsConfig.flatMap(t => t.acceptedFormats.map(normalizeFormat))
)).sort();

const availableOutputFormats = Array.from(new Set(
  toolsConfig.map(t => {
    const parts = t.slug.split('-to-');
    return parts.length > 1 ? normalizeFormat(parts[1]) : null;
  }).filter(Boolean) as string[]
)).sort();

const stats = [
  { value: '16+', label: 'Free Tools', icon: Sparkles },
  { value: '100%', label: 'Private', icon: Lock },
  { value: '0', label: 'Uploads', icon: Shield },
  { value: 'Instant', label: 'Processing', icon: Clock },
];

const features = [
  {
    icon: Shield,
    title: '100% Private',
    description: 'Your files never leave your device. All processing happens in your browser.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Web Workers process files off the main thread for instant results.',
  },
  {
    icon: Globe,
    title: 'Works Offline',
    description: 'Use tools without internet once loaded. Perfect for sensitive files.',
  },
  {
    icon: Lock,
    title: 'No Registration',
    description: 'No accounts, no email, no tracking. Just tools that work.',
  },
];

// ============================================
// Helper Functions
// ============================================

function getInputFormatFromTool(tool: Tool): string | null {
  if (tool.acceptedFormats.length === 0) return null;
  return normalizeFormat(tool.acceptedFormats[0]);
}

function getOutputFormatFromTool(tool: Tool): string | null {
  const parts = tool.slug.split('-to-');
  return parts.length > 1 ? normalizeFormat(parts[1]) : null;
}

function getCategoryIcon(category: string) {
  switch (category) {
    case 'image': return Image;
    case 'pdf': return FileText;
    case 'text': return Type;
    case 'video': return Video;
    case 'audio': return Music;
    case 'date': return Clock;
    case 'json': return FileText;
    case 'crypto': return Lock;
    case 'web': return Globe;
    default: return Zap;
  }
}

// ============================================
// Components
// ============================================

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-500"></div>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur-sm mb-8">
            <Shield className="h-4 w-4 text-green-400" />
            <span>100% Browser-Based • No Upload Required</span>
          </div>

          {/* Main Heading - SEO Optimized */}
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Free Online Tools
            <span className="block mt-2 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              That Never Upload Your Files
            </span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300 sm:text-xl">
            <strong className="text-white">Privacy-First Toolbox</strong> - process your files entirely in your browser.
            Your data never leaves your device. No registration required.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="#tools">
              <Button size="lg" className="gap-2 bg-white text-slate-900 hover:bg-slate-100 px-8">
                Explore Tools
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10 px-8">
                How It Works
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-white/5 backdrop-blur-sm p-4 sm:p-6">
                <stat.icon className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl sm:text-3xl font-bold">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FilterSection({
  filters,
  onFilterChange,
  onClearFilters,
  activeFiltersCount,
}: {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string | null) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <section id="tools" className="border-b bg-muted/30 scroll-mt-4">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tools... (e.g., 'jpg to png', 'convert webp')"
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="h-12 pl-12 text-base"
            />
            {filters.search && (
              <button
                onClick={() => onFilterChange('search', '')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Quick Filters - Categories */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filters.category === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => onFilterChange('category', null)}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              All Tools
            </Button>
            {toolCategories.map((category) => {
              const Icon = getCategoryIcon(category.id);
              const count = toolsConfig.filter(t => t.category === category.id).length;
              return (
                <Button
                  key={category.id}
                  variant={filters.category === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onFilterChange('category', category.id)}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {category.label}
                  <Badge variant="secondary" className="ml-1 text-xs">{count}</Badge>
                </Button>
              );
            })}
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            Advanced Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">{activeFiltersCount} active</Badge>
            )}
          </button>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="grid gap-6 md:grid-cols-2 p-6 rounded-xl bg-background border">
              {/* Input Format */}
              <div>
                <label className="block text-sm font-medium mb-3">Input Format (I have a...)</label>
                <div className="flex flex-wrap gap-2">
                  {availableInputFormats.map((formatId) => {
                    const meta = formatMetadata[formatId] || { label: formatId.toUpperCase(), icon: '📁' };
                    return (
                      <Button
                        key={formatId}
                        variant={filters.inputFormat === formatId ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onFilterChange('inputFormat', filters.inputFormat === formatId ? null : formatId)}
                        className="gap-1"
                      >
                        <span>{meta.icon}</span>
                        {meta.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Output Format */}
              <div>
                <label className="block text-sm font-medium mb-3">Output Format (I want...)</label>
                <div className="flex flex-wrap gap-2">
                  {availableOutputFormats.map((formatId) => {
                    const meta = formatMetadata[formatId] || { label: formatId.toUpperCase(), color: 'bg-slate-500' };
                    return (
                      <Button
                        key={formatId}
                        variant={filters.outputFormat === formatId ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onFilterChange('outputFormat', filters.outputFormat === formatId ? null : formatId)}
                        className="gap-2"
                      >
                        <span className={`w-3 h-3 rounded-full ${meta.color || 'bg-slate-500'}`}></span>
                        {meta.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearFilters} className="gap-2">
              <X className="h-4 w-4" />
              Clear all filters
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const inputFormat = getInputFormatFromTool(tool);
  const outputFormat = getOutputFormatFromTool(tool);

  return (
    <Link href={`/tools/${tool.category}/${tool.slug}`} className="group block">
      <Card className="h-full transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-500/50 hover:-translate-y-1">
        <div className="flex h-full flex-col p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {/* Format Conversion Visual */}
              <div className="flex items-center gap-1 text-sm">
                <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono font-medium">
                  {inputFormat?.toUpperCase()}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-mono font-medium">
                  {outputFormat?.toUpperCase()}
                </span>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {tool.categoryLabel.replace(' Tools', '')}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {tool.name}
          </h3>

          {/* Description */}
          <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-2">
            {tool.description}
          </p>

          {/* Features Preview */}
          <div className="mt-4 flex flex-wrap gap-1">
            {tool.seo.features.slice(0, 3).map((feature) => (
              <span
                key={feature}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground"
              >
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                {feature}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Free • No signup</span>
            <span className="flex items-center gap-1 text-sm font-medium text-purple-600 dark:text-purple-400 group-hover:gap-2 transition-all">
              Open Tool
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function ToolsGrid({ tools }: { tools: Tool[] }) {
  if (tools.length === 0) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No tools found</h3>
        <p className="mt-2 text-muted-foreground">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}

function FeaturesSection() {
  return (
    <section id="how-it-works" className="py-20 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold sm:text-4xl">Why Choose Our Tools?</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Built with privacy and performance as core principles. No compromises.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/30">
                <feature.icon className="h-7 w-7 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-lg">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const faqs = [
    {
      question: 'Are these tools really free?',
      answer: 'Yes! All tools are 100% free with no hidden costs, no premium tiers, and no usage limits.',
    },
    {
      question: 'Is my data safe?',
      answer: 'Absolutely. Your files are processed entirely in your browser using JavaScript. Nothing is ever uploaded to any server.',
    },
    {
      question: 'Do I need to create an account?',
      answer: 'No account required. No email, no registration, no tracking. Just open a tool and start using it.',
    },
    {
      question: 'How does browser-based processing work?',
      answer: 'We use modern Web Workers and Canvas APIs to process files directly in your browser. This means your files never leave your device.',
    },
    {
      question: 'Can I use these tools offline?',
      answer: 'Yes! Once loaded, tools work without an internet connection. Perfect for sensitive documents.',
    },
    {
      question: 'What browsers are supported?',
      answer: 'All modern browsers including Chrome, Firefox, Safari, and Edge. We use standard web APIs for maximum compatibility.',
    },
  ];

  return (
    <section className="py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold sm:text-4xl">Frequently Asked Questions</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to know about our privacy-first tools.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {faqs.map((faq) => (
            <Card key={faq.question} className="p-6">
              <h3 className="font-semibold">{faq.question}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}



// ============================================
// Main Component
// ============================================

export function HomeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters from URL
  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('q') || '',
    category: searchParams.get('category') || null,
    inputFormat: searchParams.get('from') || null,
    outputFormat: searchParams.get('to') || null,
  });

  // Update URL when filters change
  const updateURL = useCallback((newFilters: FilterState) => {
    const params = new URLSearchParams();
    if (newFilters.search) params.set('q', newFilters.search);
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.inputFormat) params.set('from', newFilters.inputFormat);
    if (newFilters.outputFormat) params.set('to', newFilters.outputFormat);

    const queryString = params.toString();
    router.replace(queryString ? `?${queryString}` : '/', { scroll: false });
  }, [router]);

  // Handle filter changes
  const handleFilterChange = useCallback((key: keyof FilterState, value: string | null) => {
    const newFilters = { ...filters, [key]: value || null };
    setFilters(newFilters);
    updateURL(newFilters);
  }, [filters, updateURL]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    const newFilters: FilterState = {
      search: '',
      category: null,
      inputFormat: null,
      outputFormat: null,
    };
    setFilters(newFilters);
    router.replace('/', { scroll: false });
  }, [router]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.inputFormat) count++;
    if (filters.outputFormat) count++;
    return count;
  }, [filters]);

  const [randomTools, setRandomTools] = useState<Tool[]>([]);

  useEffect(() => {
    setRandomTools([...toolsConfig].sort(() => 0.5 - Math.random()).slice(0, 9));
  }, []);

  // Filter tools based on current filters
  const filteredTools = useMemo(() => {
    const hasActiveFilter = filters.search || filters.category || filters.inputFormat || filters.outputFormat;

    if (!hasActiveFilter) {
      return randomTools.length > 0 ? randomTools : toolsConfig.slice(0, 10);
    }

    return toolsConfig.filter((tool) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          tool.name.toLowerCase().includes(searchLower) ||
          tool.description.toLowerCase().includes(searchLower) ||
          tool.slug.toLowerCase().includes(searchLower) ||
          tool.keywords.some((kw) => kw.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Category filter
      if (filters.category && tool.category !== filters.category) {
        return false;
      }

      // Input format filter
      if (filters.inputFormat) {
        const toolFormats = tool.acceptedFormats.map(normalizeFormat);
        if (!toolFormats.includes(filters.inputFormat)) return false;
      }

      // Output format filter
      if (filters.outputFormat) {
        const toolOutputFormat = getOutputFormatFromTool(tool);
        if (toolOutputFormat !== filters.outputFormat) return false;
      }

      return true;
    });
  }, [filters, randomTools]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <HeroSection />

      {/* Filter Section */}
      <FilterSection
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Tools Grid */}
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {/* Results Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {filters.search || filters.category || filters.inputFormat || filters.outputFormat
                  ? 'Search Results'
                  : 'All Tools'}
              </h2>
              <p className="mt-1 text-muted-foreground">
                {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''} available
              </p>
            </div>
          </div>

          <ToolsGrid tools={filteredTools} />
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* FAQ Section */}
      <FAQSection />


    </div>
  );
}
