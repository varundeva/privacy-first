import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { getToolsByCategory } from '@/lib/tools-config';
import * as LucideIcons from 'lucide-react';

interface RelatedToolsProps {
    categoryId: string;
    currentToolId: string;
    categoryLabel: string;
}

export function RelatedTools({ categoryId, currentToolId, categoryLabel }: RelatedToolsProps) {
    const tools = getToolsByCategory(categoryId as any);
    const relatedTools = tools.filter(tool => tool.id !== currentToolId);

    if (relatedTools.length === 0) return null;

    return (
        <section className="mt-16 pt-16 border-t border-border/60">
            <div className="flex flex-col gap-2 mb-8">
                <h2 className="text-2xl font-bold tracking-tight">More {categoryLabel}</h2>
                <p className="text-muted-foreground">Discover other helpful tools in this category.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedTools.map((tool) => {
                    const IconComponent = (LucideIcons as any)[tool.icon] || LucideIcons.Settings;

                    return (
                        <Link
                            key={tool.id}
                            href={`/tools/${tool.category}/${tool.slug}`}
                            className="group"
                        >
                            <Card className="p-5 h-full transition-all duration-300 hover:shadow-lg hover:border-indigo-500/30 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 flex items-start gap-4">
                                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                                    <IconComponent className="h-5 w-5" />
                                </div>
                                <div className="flex-1 space-y-1 overflow-hidden">
                                    <h3 className="font-bold text-base group-hover:text-indigo-600 transition-colors truncate">
                                        {tool.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
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
