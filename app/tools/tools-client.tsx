'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toolsConfig, toolCategories, Tool, ToolCategoryId } from '@/lib/tools-config';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetTrigger,
  SheetTitle,
  SheetContent,
} from '@/components/ui/sheet';
import {
  Search,
  Shield,
  ArrowLeft,
  ArrowRight,
  Image,
  FileText,
  Type,
  Video,
  Music,
  X,
  Sparkles,
  ArrowUpRight,
  Filter,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Calendar,
  Lock,
  Globe,
} from 'lucide-react';

// ============================================
// Types
// ============================================

type ViewMode = 'grid' | 'list';

interface FilterState {
  search: string;
  category: ToolCategoryId | null;
  inputFormat: string | null;
  outputFormat: string | null;
}

interface FormatMetadata {
  label: string;
  description: string;
  color: string;
}

// ============================================
// Constants & Metadata
// ============================================

const FORMAT_METADATA: Record<string, FormatMetadata> = {
  // Image Formats
  jpg: { label: 'JPG/JPEG', description: 'Standard photo format', color: 'bg-amber-500' },
  png: { label: 'PNG', description: 'Lossless with transparency', color: 'bg-blue-500' },
  webp: { label: 'WebP', description: 'Modern web format', color: 'bg-green-500' },
  gif: { label: 'GIF', description: 'Animated images', color: 'bg-purple-500' },
  bmp: { label: 'BMP', description: 'Uncompressed bitmap', color: 'bg-pink-500' },
  svg: { label: 'SVG', description: 'Vector graphics', color: 'bg-orange-500' },
  ico: { label: 'ICO', description: 'Windows icons', color: 'bg-yellow-500' },

  // Document Formats
  pdf: { label: 'PDF', description: 'Portable Document Format', color: 'bg-red-500' },
  txt: { label: 'Text', description: 'Plain text files', color: 'bg-gray-500' },
  md: { label: 'Markdown', description: 'Formatted text', color: 'bg-gray-600' },
  json: { label: 'JSON', description: 'Data format', color: 'bg-yellow-600' },
  csv: { label: 'CSV', description: 'Spreadsheet data', color: 'bg-green-600' },
  xml: { label: 'XML', description: 'Markup language', color: 'bg-blue-600' },
};

const DEFAULT_METADATA: FormatMetadata = {
  label: 'Unknown',
  description: 'File format',
  color: 'bg-slate-500',
};

// ============================================
// Helper Functions
// ============================================

function getFormatMetadata(format: string): FormatMetadata {
  return FORMAT_METADATA[format] || {
    ...DEFAULT_METADATA,
    label: format.toUpperCase(),
  };
}

function getInputFormatFromTool(tool: Tool): string | null {
  const formats = tool.acceptedFormats.map(f => f.toLowerCase());

  if (formats.some(f => f.includes('pdf'))) return 'pdf';
  if (formats.some(f => f.includes('jpg') || f.includes('jpeg'))) return 'jpg';
  if (formats.some(f => f.includes('png'))) return 'png';
  if (formats.some(f => f.includes('webp'))) return 'webp';
  if (formats.some(f => f.includes('gif'))) return 'gif';
  if (formats.some(f => f.includes('bmp'))) return 'bmp';
  if (formats.some(f => f.includes('svg'))) return 'svg';
  if (formats.some(f => f.includes('ico'))) return 'ico';

  // For text tools or others, take the first format's extension
  if (formats.length > 0) {
    return formats[0].replace('.', '');
  }

  return null;
}

function getOutputFormatFromTool(tool: Tool): string | null {
  const slug = tool.slug.toLowerCase();

  // Attempt to extract output format from slug (e.g., pdf-to-jpg -> jpg)
  const parts = slug.split('-to-');
  if (parts.length === 2) {
    return parts[1];
  }

  return null;
}

function getCategoryIcon(category: string) {
  switch (category) {
    case 'image': return Image;
    case 'pdf': return FileText;
    case 'text': return Type;
    case 'video': return Video;
    case 'audio': return Music;
    case 'date': return Calendar;
    case 'json': return FileText;
    case 'crypto': return Lock;
    case 'web': return Globe;
    default: return Sparkles;
  }
}

// ============================================
// Components
// ============================================

function Breadcrumb() {
  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
      <Link href="/" className="hover:text-foreground transition-colors">
        Home
      </Link>
      <span>/</span>
      <span className="text-foreground font-medium">All Tools</span>
    </nav>
  );
}

function PageHeader() {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold sm:text-4xl">All Tools</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Browse our collection of {toolsConfig.length} free online tools.
        All tools process files in your browser for maximum privacy.
      </p>
    </div>
  );
}

function FilterSidebar({
  filters,
  onFilterChange,
  onClearFilters,
  toolCounts,
  availableInputFormats,
  availableOutputFormats,
  className = "w-64 flex-shrink-0 space-y-6",
}: {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string | null) => void;
  onClearFilters: () => void;
  toolCounts: { categories: Record<string, number>; inputs: Record<string, number>; outputs: Record<string, number> };
  availableInputFormats: string[];
  availableOutputFormats: string[];
  className?: string;
}) {
  const hasActiveFilters = filters.category || filters.inputFormat || filters.outputFormat;

  return (
    <aside className={className}>
      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters} className="w-full justify-start gap-2">
          <X className="h-4 w-4" />
          Clear all filters
        </Button>
      )}

      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <LayoutGrid className="h-4 w-4" />
          Categories
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => onFilterChange('category', null)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${filters.category === null
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
              : 'hover:bg-muted'
              }`}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              All Tools
            </span>
            <Badge variant="secondary">{toolsConfig.length}</Badge>
          </button>
          {toolCategories.map((category) => {
            const Icon = getCategoryIcon(category.id);
            const count = toolCounts.categories[category.id] || 0;
            if (count === 0) return null;
            return (
              <button
                key={category.id}
                onClick={() => onFilterChange('category', category.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${filters.category === category.id
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                  : 'hover:bg-muted'
                  }`}
              >
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {category.label}
                </span>
                <Badge variant="secondary">{count}</Badge>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Format */}
      {availableInputFormats.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            I have a...
          </h3>
          <div className="space-y-1">
            {availableInputFormats.map((formatId) => {
              const count = toolCounts.inputs[formatId] || 0;
              const metadata = getFormatMetadata(formatId);
              if (count === 0) return null;

              return (
                <button
                  key={formatId}
                  onClick={() => onFilterChange('inputFormat', filters.inputFormat === formatId ? null : formatId)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${filters.inputFormat === formatId
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'hover:bg-muted'
                    }`}
                >
                  <div className="text-left">
                    <div className="font-medium">{metadata.label}</div>
                    <div className="text-xs text-muted-foreground">{metadata.description}</div>
                  </div>
                  <Badge variant="secondary">{count}</Badge>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Output Format */}
      {availableOutputFormats.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" />
            I want...
          </h3>
          <div className="space-y-1">
            {availableOutputFormats.map((formatId) => {
              const count = toolCounts.outputs[formatId] || 0;
              const metadata = getFormatMetadata(formatId);
              if (count === 0) return null;

              return (
                <button
                  key={formatId}
                  onClick={() => onFilterChange('outputFormat', filters.outputFormat === formatId ? null : formatId)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${filters.outputFormat === formatId
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                    : 'hover:bg-muted'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${metadata.color}`}></span>
                    <div className="text-left">
                      <div className="font-medium">{metadata.label}</div>
                      <div className="text-xs text-muted-foreground">{metadata.description}</div>
                    </div>
                  </div>
                  <Badge variant="secondary">{count}</Badge>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}

function ToolCardGrid({ tool }: { tool: Tool }) {
  const inputFormat = getInputFormatFromTool(tool);
  const outputFormat = getOutputFormatFromTool(tool);

  return (
    <Link href={`/tools/${tool.category}/${tool.slug}`} className="group block">
      <Card className="h-full transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:border-purple-500/50 hover:-translate-y-1">
        <div className="flex h-full flex-col p-5">
          {/* Format Conversion Visual */}
          {inputFormat && (
            <div className="flex items-center gap-2 text-sm mb-3">
              <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono font-medium text-xs">
                {inputFormat.toUpperCase()}
              </span>
              {outputFormat && (
                <>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className="px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-mono font-medium text-xs">
                    {outputFormat.toUpperCase()}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Title */}
          <h3 className="font-semibold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {tool.name}
          </h3>

          {/* Description */}
          <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-2">
            {tool.description}
          </p>

          {/* CTA */}
          <div className="mt-3 flex items-center gap-1 text-sm font-medium text-purple-600 dark:text-purple-400">
            <span>Use Tool</span>
            <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>
      </Card>
    </Link>
  );
}

function ToolCardList({ tool }: { tool: Tool }) {
  const inputFormat = getInputFormatFromTool(tool);
  const outputFormat = getOutputFormatFromTool(tool);

  return (
    <Link href={`/tools/${tool.category}/${tool.slug}`} className="group block">
      <Card className="transition-all duration-200 hover:shadow-md hover:border-purple-500/50">
        <div className="flex items-center gap-3 p-3 sm:gap-6 sm:p-4">
          {/* Format Visual */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 min-w-[60px] sm:w-32 flex-shrink-0">
            {inputFormat && (
              <>
                <Badge variant="outline" className="px-1.5 py-0.5 text-[10px] sm:text-xs font-mono bg-slate-100 dark:bg-slate-800 border-0">
                  {inputFormat.toUpperCase()}
                </Badge>
                {outputFormat && (
                  <>
                    <ArrowRight className="hidden sm:block h-3 w-3 text-muted-foreground" />
                    <ArrowRight className="sm:hidden h-2 w-2 text-muted-foreground rotate-90" />
                    <Badge variant="outline" className="px-1.5 py-0.5 text-[10px] sm:text-xs font-mono bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0">
                      {outputFormat.toUpperCase()}
                    </Badge>
                  </>
                )}
              </>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm sm:text-base group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
              {tool.name}
            </h3>
            <p className="hidden sm:block text-sm text-muted-foreground truncate">{tool.description}</p>
          </div>

          {/* Features */}
          <div className="hidden lg:flex items-center gap-2">
            {tool.seo.features.slice(0, 2).map((feature) => (
              <Badge key={feature} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>

          {/* CTA */}
          <div className="flex-shrink-0">
            <Button size="icon" variant="ghost" className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 sm:gap-1">
              <span className="hidden sm:inline">Open</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function ToolsGrid({ tools, viewMode }: { tools: Tool[]; viewMode: ViewMode }) {
  if (tools.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No tools found</h3>
        <p className="mt-2 text-muted-foreground max-w-md mx-auto">
          Try adjusting your filters or search to find what you're looking for.
        </p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-2">
        {tools.map((tool) => (
          <ToolCardList key={tool.id} tool={tool} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {tools.map((tool) => (
        <ToolCardGrid key={tool.id} tool={tool} />
      ))}
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function ToolsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Initialize filters from URL
  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('q') || '',
    category: (searchParams.get('category') as ToolCategoryId) || null,
    inputFormat: searchParams.get('from') || null,
    outputFormat: searchParams.get('to') || null,
  });

  // Calculate tool counts for filters and derive available formats
  const { toolCounts, availableInputFormats, availableOutputFormats } = useMemo(() => {
    const categories: Record<string, number> = {};
    const inputs: Record<string, number> = {};
    const outputs: Record<string, number> = {};
    const inputSet = new Set<string>();
    const outputSet = new Set<string>();

    toolsConfig.forEach((tool) => {
      categories[tool.category] = (categories[tool.category] || 0) + 1;

      const input = getInputFormatFromTool(tool);
      if (input) {
        inputs[input] = (inputs[input] || 0) + 1;
        inputSet.add(input);
      }

      const output = getOutputFormatFromTool(tool);
      if (output) {
        outputs[output] = (outputs[output] || 0) + 1;
        outputSet.add(output);
      }
    });

    return {
      toolCounts: { categories, inputs, outputs },
      availableInputFormats: Array.from(inputSet).sort(),
      availableOutputFormats: Array.from(outputSet).sort()
    };
  }, []);

  // Update URL when filters change
  const updateURL = useCallback((newFilters: FilterState) => {
    const params = new URLSearchParams();
    if (newFilters.search) params.set('q', newFilters.search);
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.inputFormat) params.set('from', newFilters.inputFormat);
    if (newFilters.outputFormat) params.set('to', newFilters.outputFormat);

    const queryString = params.toString();
    router.replace(queryString ? `/tools?${queryString}` : '/tools', { scroll: false });
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
    router.replace('/tools', { scroll: false });
  }, [router]);

  // Filter tools based on current filters
  const filteredTools = useMemo(() => {
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
        const toolInputFormat = getInputFormatFromTool(tool);
        if (toolInputFormat !== filters.inputFormat) return false;
      }

      // Output format filter
      if (filters.outputFormat) {
        const toolOutputFormat = getOutputFormatFromTool(tool);
        if (toolOutputFormat !== filters.outputFormat) return false;
      }

      return true;
    });
  }, [filters]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center justify-between gap-4">
            <PageHeader />
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="text-sm text-muted-foreground">100% Private</span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex gap-8">
          {/* Sidebar */}
          {/* Sidebar - Desktop */}
          <div className="hidden lg:block">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
              toolCounts={toolCounts}
              availableInputFormats={availableInputFormats}
              availableOutputFormats={availableOutputFormats}
            />
          </div>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Search & View Toggle */}
            {/* Search & View Toggle & Mobile Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search tools..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
                {filters.search && (
                  <button
                    onClick={() => handleFilterChange('search', '')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                {/* Mobile Filter Trigger */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden gap-2 flex-1 sm:flex-none">
                      <Filter className="h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto px-6 pt-10">
                    <SheetTitle className="text-lg font-bold mb-4">Filter Tools</SheetTitle>
                    <FilterSidebar
                      filters={filters}
                      onFilterChange={handleFilterChange}
                      onClearFilters={clearFilters}
                      toolCounts={toolCounts}
                      availableInputFormats={availableInputFormats}
                      availableOutputFormats={availableOutputFormats}
                      className="space-y-6"
                    />
                  </SheetContent>
                </Sheet>

                {/* View Toggle */}
                <div className="hidden sm:flex items-center border rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-muted' : ''}`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-muted' : ''}`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="text-sm text-muted-foreground mb-4">
              Showing {filteredTools.length} of {toolsConfig.length} tools
            </div>

            {/* Tools Grid */}
            <ToolsGrid tools={filteredTools} viewMode={viewMode} />
          </main>
        </div>
      </div>
    </div>
  );
}
