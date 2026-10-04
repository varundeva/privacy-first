import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { getToolsByCategory } from '@/lib/tools-config';
import { ArrowRight, ChevronRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface RelatedToolsProps {
  categoryId: string;
  currentToolId: string;
  categoryLabel: string;
}

export function RelatedTools({ categoryId, currentToolId, categoryLabel }: RelatedToolsProps) {
  const tools = getToolsByCategory(categoryId as any);
  const relatedTools = tools.filter((tool) => tool.id !== currentToolId);

  if (relatedTools.length === 0) return null;

  return (
    <section className="pt-16 border-t border-border/60">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">More {categoryLabel}</h2>
          <p className="text-sm text-muted-foreground">Other private client-side utilities in this collection.</p>
        </div>
        <Link
          href={`/tools/${categoryId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline group"
        >
          <span>View all {categoryLabel}</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatedTools.map((tool) => {
          const IconComponent = (LucideIcons as any)[tool.icon] || LucideIcons.Settings;

          return (
            <Link
              key={tool.id}
              href={`/tools/${tool.category}/${tool.slug}`}
              className="group block"
            >
              <Card className="p-5 h-full transition-all duration-300 hover:shadow-lg hover:border-primary/40 hover:bg-muted/30 flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  <IconComponent className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1 overflow-hidden min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                      {tool.name}
                    </h3>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/60 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all flex-shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
