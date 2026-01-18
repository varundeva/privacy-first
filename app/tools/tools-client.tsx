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
  CheckCircle2,
  ArrowUpRight,
  Filter,
  LayoutGrid,
  List,
  SlidersHorizontal,
} from 'lucide-react';

// ============================================
// Types
// ============================================

type InputFormat = 'jpg' | 'png' | 'webp' | 'gif' | 'bmp' | 'svg' | 'ico' | 'pdf';
type OutputFormat = 'png' | 'jpg' | 'webp' | 'pdf';
type ViewMode = 'grid' | 'list';

interface FilterState {
  search: string;
  category: ToolCategoryId | null;
  inputFormat: InputFormat | null;
  outputFormat: OutputFormat | null;
}

// ============================================
// Constants
// ============================================

const inputFormats: { id: InputFormat; label: string; description: string }[] = [
  { id: 'jpg', label: 'JPG/JPEG', description: 'Standard photo format' },
  { id: 'png', label: 'PNG', description: 'Lossless with transparency' },
  { id: 'webp', label: 'WebP', description: 'Modern web format' },
  { id: 'gif', label: 'GIF', description: 'Animated images' },
  { id: 'bmp', label: 'BMP', description: 'Uncompressed bitmap' },
  { id: 'svg', label: 'SVG', description: 'Vector graphics' },
  { id: 'ico', label: 'ICO', description: 'Windows icons' },
  { id: 'pdf', label: 'PDF', description: 'Portable Document Format' },
];

const outputFormats: { id: OutputFormat; label: string; description: string; color: string }[] = [
  { id: 'png', label: 'PNG', description: 'Best for graphics & transparency', color: 'bg-blue-500' },
  { id: 'jpg', label: 'JPG', description: 'Best for photos & sharing', color: 'bg-amber-500' },
  { id: 'webp', label: 'WebP', description: 'Best for web performance', color: 'bg-green-500' },
];

// ============================================
// Helper Functions
// ============================================

function getInputFormatFromTool(tool: Tool): InputFormat | null {
  const formats = tool.acceptedFormats.join(' ').toLowerCase();
  if (formats.includes('jpg') || formats.includes('jpeg')) return 'jpg';
  if (formats.includes('png')) return 'png';
  if (formats.includes('webp')) return 'webp';
  if (formats.includes('gif')) return 'gif';
  if (formats.includes('bmp')) return 'bmp';
  if (formats.includes('svg')) return 'svg';
  if (formats.includes('ico')) return 'ico';
  if (formats.includes('pdf')) return 'pdf';
  return null;
}

function getOutputFormatFromTool(tool: Tool): OutputFormat | null {
  const slug = tool.slug.toLowerCase();
  if (slug.endsWith('-to-png')) return 'png';
  if (slug.endsWith('-to-jpg')) return 'jpg';
  if (slug.endsWith('-to-webp')) return 'webp';
  return null;
}

function getCategoryIcon(category: string) {
  switch (category) {
    case 'image': return Image;
    case 'pdf': return FileText;
    case 'text': return Type;
    case 'video': return Video;
    case 'audio': return Music;
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
}: {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string | null) => void;
  onClearFilters: () => void;
  toolCounts: { categories: Record<string, number>; inputs: Record<string, number>; outputs: Record<string, number> };
}) {
  const hasActiveFilters = filters.category || filters.inputFormat || filters.outputFormat;

  return (
    <aside className="w-64 flex-shrink-0 space-y-6">
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
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
              filters.category === null 
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
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  filters.category === category.id 
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
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Filter className="h-4 w-4" />
          I have a...
        </h3>
        <div className="space-y-1">
          {inputFormats.map((format) => {
            const count = toolCounts.inputs[format.id] || 0;
            if (count === 0) return null;
            return (
              <button
                key={format.id}
                onClick={() => onFilterChange('inputFormat', filters.inputFormat === format.id ? null : format.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  filters.inputFormat === format.id 
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
                    : 'hover:bg-muted'
                }`}
              >
                <div className="text-left">
                  <div className="font-medium">{format.label}</div>
                  <div className="text-xs text-muted-foreground">{format.description}</div>
                </div>
                <Badge variant="secondary">{count}</Badge>
              </button>
            );
          })}
        </div>
      </div>

      {/* Output Format */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          I want...
        </h3>
        <div className="space-y-1">
          {outputFormats.map((format) => {
            const count = toolCounts.outputs[format.id] || 0;
            if (count === 0) return null;
            return (
              <button
                key={format.id}
                onClick={() => onFilterChange('outputFormat', filters.outputFormat === format.id ? null : format.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  filters.outputFormat === format.id 
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
                    : 'hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${format.color}`}></span>
                  <div className="text-left">
                    <div className="font-medium">{format.label}</div>
                    <div className="text-xs text-muted-foreground">{format.description}</div>
                  </div>
                </div>
                <Badge variant="secondary">{count}</Badge>
              </button>
            );
          })}
        </div>
      </div>
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
          <div className="flex items-center gap-2 text-sm mb-3">
            <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono font-medium text-xs">
              {inputFormat?.toUpperCase()}
            </span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span className="px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-mono font-medium text-xs">
              {outputFormat?.toUpperCase()}
            </span>
          </div>

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
        <div className="flex items-center gap-6 p-4">
          {/* Format Visual */}
          <div className="flex items-center gap-2 w-32 flex-shrink-0">
            <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono font-medium text-xs">
              {inputFormat?.toUpperCase()}
            </span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span className="px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-mono font-medium text-xs">
              {outputFormat?.toUpperCase()}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              {tool.name}
            </h3>
            <p className="text-sm text-muted-foreground truncate">{tool.description}</p>
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
          <Button size="sm" variant="ghost" className="gap-1 flex-shrink-0">
            Open
            <ArrowRight className="h-4 w-4" />
          </Button>
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

  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Initialize filters from URL
  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('q') || '',
    category: (searchParams.get('category') as ToolCategoryId) || null,
    inputFormat: (searchParams.get('from') as InputFormat) || null,
    outputFormat: (searchParams.get('to') as OutputFormat) || null,
  });

  // Calculate tool counts for filters
  const toolCounts = useMemo(() => {
    const categories: Record<string, number> = {};
    const inputs: Record<string, number> = {};
    const outputs: Record<string, number> = {};

    toolsConfig.forEach((tool) => {
      categories[tool.category] = (categories[tool.category] || 0) + 1;
      
      const input = getInputFormatFromTool(tool);
      if (input) inputs[input] = (inputs[input] || 0) + 1;
      
      const output = getOutputFormatFromTool(tool);
      if (output) outputs[output] = (outputs[output] || 0) + 1;
    });

    return { categories, inputs, outputs };
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
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            toolCounts={toolCounts}
          />

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Search & View Toggle */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
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
              <div className="flex items-center border rounded-lg p-1">
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
