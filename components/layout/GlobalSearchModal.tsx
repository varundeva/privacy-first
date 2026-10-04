'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { toolsConfig, toolCategories, ToolCategoryId } from '@/lib/tools-config';
import { competitorsData } from '@/lib/alternatives-data';
import * as LucideIcons from 'lucide-react';
import { Search, Sparkles, ArrowRight } from 'lucide-react';

interface GlobalSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearchModal({ open, onOpenChange }: GlobalSearchModalProps) {
  const router = useRouter();

  // Keyboard shortcut Cmd+K / Ctrl+K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const handleSelect = React.useCallback(
    (url: string) => {
      onOpenChange(false);
      router.push(url);
    },
    [onOpenChange, router]
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search Tools & Converters"
      description="Quickly find any private browser-based tool or competitor comparison"
    >
      <CommandInput placeholder="Type a tool name, format (png, pdf, json), or action..." />
      <CommandList className="max-h-[70vh] sm:max-h-[450px]">
        <CommandEmpty>
          <div className="py-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">No matching utilities found.</p>
            <p className="text-xs text-muted-foreground/75">
              Try searching for &quot;pdf&quot;, &quot;compress&quot;, &quot;image&quot;, or &quot;json&quot;.
            </p>
          </div>
        </CommandEmpty>

        {/* Competitor Comparisons */}
        <CommandGroup heading="Free Private Alternatives">
          {Object.values(competitorsData).map((comp) => (
            <CommandItem
              key={comp.slug}
              value={`${comp.name} alternative compare vs cloud`}
              onSelect={() => handleSelect(`/alternatives/${comp.slug}`)}
              className="flex items-center justify-between py-2.5 px-3 cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{comp.name} Alternative</span>
                  <span className="text-xs text-muted-foreground line-clamp-1">{comp.tagline}</span>
                </div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Group by tool category */}
        {toolCategories.map((cat) => {
          const categoryTools = toolsConfig.filter((t) => t.category === cat.id);
          if (categoryTools.length === 0) return null;

          return (
            <CommandGroup key={cat.id} heading={cat.label}>
              {categoryTools.map((tool) => {
                const IconComponent = (LucideIcons as any)[tool.icon] || LucideIcons.Settings;

                return (
                  <CommandItem
                    key={tool.id}
                    value={`${tool.name} ${tool.keywords.join(' ')} ${tool.description} ${cat.label}`}
                    onSelect={() => handleSelect(`/tools/${tool.category}/${tool.slug}`)}
                    className="flex items-center justify-between py-2.5 px-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="p-1.5 rounded-md bg-muted text-foreground flex-shrink-0">
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-medium text-sm truncate">{tool.name}</span>
                        <span className="text-xs text-muted-foreground truncate">{tool.description}</span>
                      </div>
                    </div>
                    {tool.acceptedFormats.length > 0 && (
                      <span className="text-[11px] font-mono bg-muted/80 text-muted-foreground px-1.5 py-0.5 rounded flex-shrink-0 ml-2">
                        {tool.acceptedFormats[0]}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          );
        })}
      </CommandList>
    </CommandDialog>
  );
}
