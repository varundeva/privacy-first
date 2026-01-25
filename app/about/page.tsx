import type { Metadata } from 'next';
import Link from 'next/link';
import {
    Shield,
    Zap,
    Heart,
    Globe,
    Lock,
    Code,
    Users,
    Target,
    ArrowRight,
    Github
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
    title: 'About Us',
    description: 'Learn about Privacy-First Toolbox - our mission to provide free, privacy-respecting online tools that process your files entirely in your browser.',
    openGraph: {
        title: 'About Us | Privacy-First Toolbox',
        description: 'Learn about Privacy-First Toolbox - our mission to provide free, privacy-respecting online tools.',
    },
};

const values = [
    {
        icon: Lock,
        title: 'Privacy First',
        description: 'Your files never leave your device. All processing happens in your browser.',
        color: 'from-green-500 to-emerald-600',
    },
    {
        icon: Zap,
        title: 'Fast & Efficient',
        description: 'Modern web technologies ensure quick processing without server delays.',
        color: 'from-yellow-500 to-orange-600',
    },
    {
        icon: Heart,
        title: 'Free Forever',
        description: 'No subscriptions, no hidden fees. Our tools are completely free to use.',
        color: 'from-red-500 to-pink-600',
    },
    {
        icon: Code,
        title: 'Open Source',
        description: 'Transparency through open-source code. Audit, contribute, and improve.',
        color: 'from-purple-500 to-violet-600',
    },
];

const stats = [
    { value: '100%', label: 'Browser-based' },
    { value: '0', label: 'Files stored' },
    { value: '∞', label: 'Usage limit' },
    { value: 'Free', label: 'Forever' },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative py-20 sm:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-blue-500/5 to-transparent" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-3xl opacity-30" />

                <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 mb-8 shadow-lg shadow-purple-500/25">
                        <Shield className="h-10 w-10 text-white" />
                    </div>

                    <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                        About Privacy-First Toolbox
                    </h1>

                    <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        We believe you shouldn&apos;t have to sacrifice your privacy to use simple online tools.
                        That&apos;s why we built a platform where your files never leave your device.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 sm:py-24 bg-muted/30">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="grid gap-12 lg:grid-cols-2 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
                                <Target className="h-4 w-4" />
                                Our Mission
                            </div>
                            <h2 className="text-3xl font-bold sm:text-4xl">
                                Making Privacy the Default, Not the Exception
                            </h2>
                            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                                Every day, millions of people upload sensitive files to online converters without
                                realizing those files might be stored, analyzed, or even sold. We wanted to change that.
                            </p>
                            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                                Privacy-First Toolbox was created to prove that powerful online tools don&apos;t need
                                access to your data. Using modern browser technologies like Web Workers, Canvas API,
                                and WebAssembly, we process everything locally on your device.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-4">
                                <Button asChild>
                                    <Link href="/tools">
                                        Try Our Tools
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button variant="outline" asChild>
                                    <a
                                        href="https://github.com/varundeva/privacy-first"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Github className="mr-2 h-4 w-4" />
                                        View on GitHub
                                    </a>
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {stats.map((stat, index) => (
                                <div
                                    key={index}
                                    className="rounded-2xl border bg-card p-6 text-center"
                                >
                                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                        {stat.value}
                                    </div>
                                    <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-16 sm:py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold sm:text-4xl">Our Core Values</h2>
                        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                            Every decision we make is guided by these principles.
                        </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {values.map((value, index) => (
                            <div
                                key={index}
                                className="group rounded-2xl border bg-card p-6 hover:shadow-lg transition-all duration-300"
                            >
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${value.color} mb-4 group-hover:scale-110 transition-transform`}>
                                    <value.icon className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="font-semibold text-lg">{value.title}</h3>
                                <p className="mt-2 text-sm text-muted-foreground">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-16 sm:py-24 bg-muted/30">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold sm:text-4xl">How It Works</h2>
                        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                            A technical look at how we keep your files 100% private.
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-3">
                        <div className="relative">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                                    1
                                </div>
                                <h3 className="font-semibold">You Select Files</h3>
                            </div>
                            <p className="text-muted-foreground pl-14">
                                When you choose a file, it&apos;s loaded directly into your browser&apos;s memory.
                                No upload to any server occurs.
                            </p>
                        </div>

                        <div className="relative">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                                    2
                                </div>
                                <h3 className="font-semibold">Local Processing</h3>
                            </div>
                            <p className="text-muted-foreground pl-14">
                                Our tools use Web Workers to process your files in a separate thread,
                                keeping the UI responsive while conversion happens locally.
                            </p>
                        </div>

                        <div className="relative">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                                    3
                                </div>
                                <h3 className="font-semibold">Download Result</h3>
                            </div>
                            <p className="text-muted-foreground pl-14">
                                The processed file is generated in your browser and downloaded directly.
                                Close the tab and all data is gone.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Open Source Section */}
            <section className="py-16 sm:py-24">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-900 dark:bg-gray-100 mb-6">
                        <Github className="h-8 w-8 text-white dark:text-gray-900" />
                    </div>

                    <h2 className="text-3xl font-bold sm:text-4xl">Open Source & Transparent</h2>

                    <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
                        Don&apos;t just trust us — verify it yourself. Our entire codebase is open source,
                        allowing security researchers, developers, and curious users to audit exactly how
                        our tools work.
                    </p>

                    <div className="mt-8">
                        <Button size="lg" variant="outline" asChild>
                            <a
                                href="https://github.com/varundeva/privacy-first"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Github className="mr-2 h-5 w-5" />
                                Explore the Code
                            </a>
                        </Button>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 sm:py-24 bg-gradient-to-r from-purple-600 to-blue-600">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
                    <Globe className="h-12 w-12 text-white/80 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-white sm:text-4xl">
                        Ready to Try Privacy-First Tools?
                    </h2>
                    <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
                        Convert images, manipulate PDFs, and more — all without sacrificing your privacy.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <Button size="lg" variant="secondary" asChild>
                            <Link href="/tools">
                                Browse All Tools
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10" asChild>
                            <Link href="/contact">
                                <Users className="mr-2 h-5 w-5" />
                                Contact Us
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
