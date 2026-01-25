import type { Metadata } from 'next';
import Link from 'next/link';
import {
    Heart,
    ExternalLink,
    Image as ImageIcon,
    FileText,
    Type,
    Calendar,
    FileJson,
    Lock,
    Globe,
    Palette,
    Code,
    Box,
    Layers
} from 'lucide-react';

export const metadata: Metadata = {
    title: 'Credits & Attributions',
    description: 'Open source libraries, packages, and technologies that power Privacy-First Toolbox. We are grateful to the amazing open source community.',
};

interface Package {
    name: string;
    description: string;
    url: string;
    license?: string;
}

interface Category {
    title: string;
    icon: React.ElementType;
    description: string;
    packages: Package[];
}

const credits: Category[] = [
    {
        title: 'Core Framework',
        icon: Box,
        description: 'The foundation technologies that power our application',
        packages: [
            {
                name: 'Next.js',
                description: 'React framework for production with server-side rendering, routing, and optimizations',
                url: 'https://nextjs.org',
                license: 'MIT',
            },
            {
                name: 'React',
                description: 'JavaScript library for building user interfaces',
                url: 'https://react.dev',
                license: 'MIT',
            },
            {
                name: 'TypeScript',
                description: 'Typed superset of JavaScript for better developer experience and code quality',
                url: 'https://www.typescriptlang.org',
                license: 'Apache-2.0',
            },
        ],
    },
    {
        title: 'UI Components & Styling',
        icon: Palette,
        description: 'Beautiful, accessible UI components and styling solutions',
        packages: [
            {
                name: 'Tailwind CSS',
                description: 'Utility-first CSS framework for rapid UI development',
                url: 'https://tailwindcss.com',
                license: 'MIT',
            },
            {
                name: 'Radix UI',
                description: 'Unstyled, accessible UI primitives for building high-quality design systems',
                url: 'https://www.radix-ui.com',
                license: 'MIT',
            },
            {
                name: 'Lucide React',
                description: 'Beautiful & consistent icon toolkit with 1000+ icons',
                url: 'https://lucide.dev',
                license: 'ISC',
            },
            {
                name: 'shadcn/ui',
                description: 'Re-usable components built with Radix UI and Tailwind CSS',
                url: 'https://ui.shadcn.com',
                license: 'MIT',
            },
            {
                name: 'next-themes',
                description: 'Perfect dark mode in Next.js with theme support',
                url: 'https://github.com/pacocoursey/next-themes',
                license: 'MIT',
            },
            {
                name: 'Sonner',
                description: 'Opinionated toast notification library for React',
                url: 'https://sonner.emilkowal.ski',
                license: 'MIT',
            },
            {
                name: 'Vaul',
                description: 'Drawer component for React',
                url: 'https://vaul.emilkowal.ski',
                license: 'MIT',
            },
        ],
    },
    {
        title: 'Image Processing',
        icon: ImageIcon,
        description: 'Libraries powering our browser-based image conversion tools',
        packages: [
            {
                name: 'HTML5 Canvas API',
                description: 'Native browser API for image manipulation, format conversion, and drawing',
                url: 'https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API',
                license: 'Web Standard',
            },
            {
                name: 'File API',
                description: 'Native browser API for reading and handling files locally',
                url: 'https://developer.mozilla.org/en-US/docs/Web/API/File_API',
                license: 'Web Standard',
            },
        ],
    },
    {
        title: 'PDF Processing',
        icon: FileText,
        description: 'Powerful libraries for PDF manipulation directly in the browser',
        packages: [
            {
                name: 'pdf-lib',
                description: 'Create and modify PDF documents in any JavaScript environment',
                url: 'https://pdf-lib.js.org',
                license: 'MIT',
            },
            {
                name: 'PDF.js',
                description: 'Mozilla\'s PDF rendering library for JavaScript (pdfjs-dist)',
                url: 'https://mozilla.github.io/pdf.js',
                license: 'Apache-2.0',
            },
        ],
    },
    {
        title: 'Text & Data Processing',
        icon: Type,
        description: 'Libraries for text manipulation and data format conversions',
        packages: [
            {
                name: 'diff',
                description: 'JavaScript text differencing library for comparing text',
                url: 'https://github.com/kpdecker/jsdiff',
                license: 'BSD-3-Clause',
            },
            {
                name: 'Monaco Editor',
                description: 'The code editor that powers VS Code, for in-browser code editing',
                url: 'https://microsoft.github.io/monaco-editor',
                license: 'MIT',
            },
        ],
    },
    {
        title: 'JSON & Data Tools',
        icon: FileJson,
        description: 'Libraries for JSON, YAML, CSV and data format processing',
        packages: [
            {
                name: 'js-beautify',
                description: 'Beautifier for JavaScript, JSON, CSS, and HTML',
                url: 'https://beautifier.io',
                license: 'MIT',
            },
            {
                name: 'js-yaml',
                description: 'YAML parser and serializer for JavaScript',
                url: 'https://github.com/nodeca/js-yaml',
                license: 'MIT',
            },
            {
                name: 'PapaParse',
                description: 'Fast and powerful CSV parser for JavaScript',
                url: 'https://www.papaparse.com',
                license: 'MIT',
            },
            {
                name: 'sql-formatter',
                description: 'SQL query formatter and beautifier',
                url: 'https://github.com/sql-formatter-org/sql-formatter',
                license: 'MIT',
            },
        ],
    },
    {
        title: 'Date & Time Tools',
        icon: Calendar,
        description: 'Libraries for date manipulation and timezone handling',
        packages: [
            {
                name: 'date-fns',
                description: 'Modern JavaScript date utility library',
                url: 'https://date-fns.org',
                license: 'MIT',
            },
            {
                name: 'react-day-picker',
                description: 'Flexible date picker component for React',
                url: 'https://react-day-picker.js.org',
                license: 'MIT',
            },
        ],
    },
    {
        title: 'Cryptography & Security',
        icon: Lock,
        description: 'Libraries powering our hash generators and encryption tools',
        packages: [
            {
                name: 'crypto-js',
                description: 'JavaScript library of crypto standards (MD5, SHA, AES, etc.)',
                url: 'https://github.com/brix/crypto-js',
                license: 'MIT',
            },
            {
                name: 'bcryptjs',
                description: 'JavaScript implementation of bcrypt password hashing',
                url: 'https://github.com/dcodeIO/bcrypt.js',
                license: 'MIT',
            },
        ],
    },
    {
        title: 'Web Utilities',
        icon: Globe,
        description: 'Utility libraries for web-related tools',
        packages: [
            {
                name: 'ua-parser-js',
                description: 'User-Agent parser for browser and device detection',
                url: 'https://github.com/nickelov/ua-parser-js',
                license: 'MIT',
            },
            {
                name: 'react-next-google-tools',
                description: 'Lightweight library for integrating Google Analytics into React and Next.js applications',
                url: 'https://www.npmjs.com/package/react-next-google-tools',
                license: 'MIT',
            },
        ],
    },
    {
        title: 'UI Interactions',
        icon: Layers,
        description: 'Libraries for advanced UI interactions like drag-and-drop',
        packages: [
            {
                name: '@dnd-kit',
                description: 'Modern, lightweight drag and drop toolkit for React',
                url: 'https://dndkit.com',
                license: 'MIT',
            },
            {
                name: 'embla-carousel-react',
                description: 'Lightweight carousel library with great performance',
                url: 'https://www.embla-carousel.com',
                license: 'MIT',
            },
            {
                name: 'react-resizable-panels',
                description: 'Resizable panel components for React',
                url: 'https://github.com/bvaughn/react-resizable-panels',
                license: 'MIT',
            },
        ],
    },
    {
        title: 'Forms & Validation',
        icon: Code,
        description: 'Libraries for form handling and data validation',
        packages: [
            {
                name: 'React Hook Form',
                description: 'Performant, flexible and extensible forms with easy validation',
                url: 'https://react-hook-form.com',
                license: 'MIT',
            },
            {
                name: 'Zod',
                description: 'TypeScript-first schema validation with static type inference',
                url: 'https://zod.dev',
                license: 'MIT',
            },
        ],
    },
];

export default function CreditsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            {/* Hero Section */}
            <section className="relative py-16 sm:py-24">
                <div className="mx-auto max-w-4xl px-4 sm:px-6">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 mb-6">
                            <Heart className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                            Credits & Attributions
                        </h1>
                        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                            Privacy-First Toolbox is built on the shoulders of giants. We are deeply grateful
                            to the amazing open source community for creating these incredible tools.
                        </p>
                    </div>
                </div>
            </section>

            {/* Credits Content */}
            <section className="pb-16 sm:pb-24">
                <div className="mx-auto max-w-5xl px-4 sm:px-6">
                    {/* Summary Card */}
                    <div className="mb-12 p-6 rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border">
                        <h2 className="text-xl font-semibold mb-3">Open Source Philosophy</h2>
                        <p className="text-muted-foreground">
                            Every tool on Privacy-First Toolbox runs entirely in your browser thanks to these
                            open source libraries. No server-side processing means your data stays private.
                            We believe in giving back to the community that makes this possible.
                        </p>
                    </div>

                    {/* Credits by Category */}
                    <div className="space-y-12">
                        {credits.map((category) => (
                            <div key={category.title}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                        <category.icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold">{category.title}</h2>
                                        <p className="text-sm text-muted-foreground">{category.description}</p>
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    {category.packages.map((pkg) => (
                                        <a
                                            key={pkg.name}
                                            href={pkg.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group block p-4 rounded-xl border bg-card hover:bg-muted/50 hover:border-primary/50 transition-all duration-200"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="font-semibold group-hover:text-primary transition-colors">
                                                    {pkg.name}
                                                </h3>
                                                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                                            </div>
                                            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                                {pkg.description}
                                            </p>
                                            {pkg.license && (
                                                <span className="inline-block mt-3 px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
                                                    {pkg.license}
                                                </span>
                                            )}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Thank You Section */}
                    <div className="mt-16 text-center p-8 rounded-2xl bg-muted/50 border">
                        <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-3">Thank You</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            A heartfelt thank you to all the maintainers, contributors, and sponsors of these
                            projects. Your dedication to open source makes tools like Privacy-First Toolbox possible.
                        </p>
                        <div className="mt-6 flex flex-wrap justify-center gap-4">
                            <Link
                                href="/about"
                                className="text-sm text-primary hover:underline"
                            >
                                About Us
                            </Link>
                            <span className="text-muted-foreground">•</span>
                            <a
                                href="https://github.com/varundeva/privacy-first"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                            >
                                View on GitHub
                                <ExternalLink className="h-3 w-3" />
                            </a>
                            <span className="text-muted-foreground">•</span>
                            <Link
                                href="/contact"
                                className="text-sm text-primary hover:underline"
                            >
                                Contact
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
