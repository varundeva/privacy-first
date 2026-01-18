'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  toolsConfig,
  toolCategories,
  Tool,
  ToolCategory,
} from '@/lib/tools-config';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, Shield, Zap } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export function HomeClient() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get('category') || null);

  const filteredTools = useMemo(() => {
    return toolsConfig.filter((tool) => {
      const matchesSearch =
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.keywords.some((kw) =>
          kw.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory =
        !selectedCategory || tool.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold text-balance">
                Privacy-First Toolbox
              </h1>
            </div>
            <p className="max-w-2xl text-lg text-muted-foreground text-balance">
              Free online tools that process your files entirely in your browser.
              Your data never leaves your device.
            </p>

            {/* Privacy Badge */}
            <div className="mt-6 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">100% Private</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Works Offline</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filter */}
      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="space-y-6">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Filter by category</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === null ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(null)}
                  size="sm"
                >
                  All Tools
                </Button>
                {toolCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant={
                      selectedCategory === category.id ? 'default' : 'outline'
                    }
                    onClick={() => setSelectedCategory(category.id)}
                    size="sm"
                  >
                    {category.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {filteredTools.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <Search className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No tools found</h3>
            <p className="mt-2 text-muted-foreground">
              Try adjusting your search or filter
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12 text-center text-sm text-muted-foreground">
        <p>
          All tools are open source and run entirely in your browser. Your data
          is never stored or transmitted.
        </p>
      </footer>
    </div>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const iconName = tool.icon as keyof typeof LucideIcons;
  const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Zap;

  return (
    <Link
      href={`/tools/${tool.category}/${tool.slug}`}
      className="group"
    >
      <Card className="h-full transition-all hover:shadow-lg hover:border-primary">
        <div className="flex h-full flex-col p-6">
          <div className="mb-4 flex items-center justify-between">
            <IconComponent className="h-8 w-8 text-primary" />
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {tool.categoryLabel}
            </span>
          </div>
          <h3 className="font-semibold group-hover:text-primary">{tool.name}</h3>
          <p className="mt-2 flex-1 text-sm text-muted-foreground">
            {tool.description}
          </p>
          <Button
            variant="ghost"
            className="mt-4 w-full gap-2 justify-start"
            asChild
          >
            <span>
              Open Tool →
            </span>
          </Button>
        </div>
      </Card>
    </Link>
  );
}
