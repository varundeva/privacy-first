'use client';

import Link from 'next/link';
import { MessageSquare, Github, Bug, Lightbulb, HelpCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const contactMethods = [
    {
        icon: Bug,
        title: 'Report a Bug',
        description: 'Found something broken? Let us know by creating an issue.',
        href: 'https://github.com/varundeva/privacy-first/issues/new?labels=bug&template=bug_report.md',
        buttonText: 'Report Bug',
        color: 'from-red-500 to-orange-600',
    },
    {
        icon: Lightbulb,
        title: 'Request a Feature',
        description: 'Have an idea for a new tool or improvement? We\'d love to hear it.',
        href: 'https://github.com/varundeva/privacy-first/issues/new?labels=enhancement&template=feature_request.md',
        buttonText: 'Request Feature',
        color: 'from-yellow-500 to-amber-600',
    },
    {
        icon: HelpCircle,
        title: 'Ask a Question',
        description: 'Need help or have a general question? Start a discussion.',
        href: 'https://github.com/varundeva/privacy-first/issues/new?labels=question',
        buttonText: 'Ask Question',
        color: 'from-blue-500 to-cyan-600',
    },
];

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            {/* Hero Section */}
            <section className="relative py-16 sm:py-24">
                <div className="mx-auto max-w-4xl px-4 sm:px-6">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 mb-6">
                            <MessageSquare className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                            Contact Us
                        </h1>
                        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                            Have questions, found a bug, or want to request a feature?
                            Reach out to us through GitHub.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Methods */}
            <section className="pb-16 sm:pb-24">
                <div className="mx-auto max-w-4xl px-4 sm:px-6">
                    {/* GitHub Repository Card */}
                    <div className="mb-12">
                        <a
                            href="https://github.com/varundeva/privacy-first"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-8 rounded-2xl border bg-card hover:bg-muted/50 transition-all duration-300 group"
                        >
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-900 dark:bg-gray-100 flex-shrink-0">
                                    <Github className="h-10 w-10 text-white dark:text-gray-900" />
                                </div>
                                <div className="text-center sm:text-left flex-1">
                                    <h2 className="text-2xl font-bold group-hover:text-primary transition-colors">
                                        Privacy-First Toolbox on GitHub
                                    </h2>
                                    <p className="mt-2 text-muted-foreground">
                                        Our project is open source! Star the repository, contribute code,
                                        or browse existing issues to see what we&apos;re working on.
                                    </p>
                                    <div className="mt-4 flex items-center justify-center sm:justify-start gap-2 text-primary">
                                        <span className="font-medium">github.com/varundeva/privacy-first</span>
                                        <ExternalLink className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        </a>
                    </div>

                    {/* Contact Options */}
                    <h2 className="text-2xl font-bold text-center mb-8">How Can We Help?</h2>

                    <div className="grid gap-6 md:grid-cols-3">
                        {contactMethods.map((method, index) => (
                            <div
                                key={index}
                                className="rounded-2xl border bg-card p-6 flex flex-col"
                            >
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${method.color} mb-4`}>
                                    <method.icon className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="font-semibold text-lg">{method.title}</h3>
                                <p className="mt-2 text-sm text-muted-foreground flex-1">
                                    {method.description}
                                </p>
                                <Button
                                    variant="outline"
                                    className="mt-4 w-full gap-2"
                                    asChild
                                >
                                    <a
                                        href={method.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {method.buttonText}
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                </Button>
                            </div>
                        ))}
                    </div>

                    {/* Additional Info */}
                    <div className="mt-12 p-6 rounded-2xl bg-muted/50 border">
                        <h3 className="font-semibold mb-3">Before Creating an Issue</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                <span>Search existing issues to avoid duplicates</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                <span>For bug reports, include steps to reproduce the issue</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                <span>For feature requests, explain the use case and benefits</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-0.5">•</span>
                                <span>Be respectful and follow our code of conduct</span>
                            </li>
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-muted-foreground mb-4">
                            Looking for more information?
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link href="/privacy-policy" className="text-sm text-primary hover:underline">
                                Privacy Policy
                            </Link>
                            <span className="text-muted-foreground">•</span>
                            <Link href="/terms-of-service" className="text-sm text-primary hover:underline">
                                Terms of Service
                            </Link>
                            <span className="text-muted-foreground">•</span>
                            <Link href="/about" className="text-sm text-primary hover:underline">
                                About Us
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
