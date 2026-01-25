import type { Metadata } from 'next';
import { FileText, AlertCircle, CheckCircle, Scale } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Terms of Service',
    description: 'Read the Terms of Service for Privacy-First Toolbox. Understand your rights and responsibilities when using our free online tools.',
    openGraph: {
        title: 'Terms of Service | Privacy-First Toolbox',
        description: 'Read the Terms of Service for Privacy-First Toolbox.',
    },
};

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            {/* Hero Section */}
            <section className="relative py-16 sm:py-24">
                <div className="mx-auto max-w-4xl px-4 sm:px-6">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 mb-6">
                            <Scale className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                            Terms of Service
                        </h1>
                        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                            Please read these terms carefully before using Privacy-First Toolbox.
                        </p>
                        <p className="mt-4 text-sm text-muted-foreground">
                            Last updated: January 25, 2026
                        </p>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="pb-16 sm:pb-24">
                <div className="mx-auto max-w-4xl px-4 sm:px-6">
                    <div className="prose max-w-none">

                        {/* Key Points */}
                        <div className="not-prose mb-12">
                            <div className="rounded-xl border bg-card p-6">
                                <h3 className="font-semibold flex items-center gap-2 mb-4">
                                    <FileText className="h-5 w-5 text-primary" />
                                    Key Points Summary
                                </h3>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2 text-sm">
                                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span>Free to use for personal and commercial purposes</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm">
                                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span>You retain all rights to your files and content</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm">
                                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span>No account or registration required</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm">
                                        <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                        <span>Service provided &quot;as is&quot; without warranties</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <h2>1. Acceptance of Terms</h2>
                        <p>
                            By accessing or using Privacy-First Toolbox (the &quot;Service&quot;), you agree to be bound by
                            these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please do not
                            use our Service.
                        </p>
                        <p>
                            We reserve the right to update these Terms at any time. Continued use of the Service
                            after changes constitutes acceptance of the modified Terms.
                        </p>

                        <h2>2. Description of Service</h2>
                        <p>
                            Privacy-First Toolbox provides free online tools for file conversion and manipulation,
                            including but not limited to:
                        </p>
                        <ul>
                            <li>Image format conversion (JPG, PNG, WebP, GIF, etc.)</li>
                            <li>PDF manipulation and conversion</li>
                            <li>Text transformation tools</li>
                            <li>Other file processing utilities</li>
                        </ul>
                        <p>
                            All tools process files locally in your web browser. We do not upload, store, or
                            have access to your files.
                        </p>

                        <h2>3. User Rights and Responsibilities</h2>
                        <h3>Your Rights</h3>
                        <ul>
                            <li>You retain full ownership of all files you process using our tools</li>
                            <li>You may use our tools for personal and commercial purposes</li>
                            <li>You may use the Service without creating an account</li>
                        </ul>

                        <h3>Your Responsibilities</h3>
                        <ul>
                            <li>You must have the legal right to process any files you use with our tools</li>
                            <li>You must not use the Service for any illegal purposes</li>
                            <li>You must not attempt to disrupt or damage the Service</li>
                            <li>You must not attempt to reverse engineer or copy the Service</li>
                            <li>You must not use automated systems to access the Service in a manner that could damage or overload our infrastructure</li>
                        </ul>

                        <h2>4. Intellectual Property</h2>
                        <h3>Your Content</h3>
                        <p>
                            You retain all intellectual property rights to files you process using our Service.
                            Since all processing occurs in your browser, we never have access to your content
                            and make no claims to it.
                        </p>

                        <h3>Our Content</h3>
                        <p>
                            The Service, including its design, code, and branding, is owned by Privacy-First Toolbox
                            and protected by intellectual property laws. You may not copy, modify, or distribute
                            our Service without permission.
                        </p>

                        <h2>5. Disclaimer of Warranties</h2>
                        <p>
                            THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
                            EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
                        </p>
                        <ul>
                            <li>Implied warranties of merchantability</li>
                            <li>Fitness for a particular purpose</li>
                            <li>Non-infringement</li>
                            <li>Accuracy or reliability of results</li>
                        </ul>
                        <p>
                            We do not warrant that the Service will be uninterrupted, error-free, or completely secure.
                        </p>

                        <h2>6. Limitation of Liability</h2>
                        <p>
                            TO THE MAXIMUM EXTENT PERMITTED BY LAW, PRIVACY-FIRST TOOLBOX SHALL NOT BE LIABLE FOR:
                        </p>
                        <ul>
                            <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                            <li>Loss of profits, data, or business opportunities</li>
                            <li>Any damages arising from your use or inability to use the Service</li>
                            <li>Any damages resulting from file conversion errors or quality issues</li>
                        </ul>
                        <p>
                            Since the Service is provided free of charge, our total liability shall not exceed $0.
                        </p>

                        <h2>7. Indemnification</h2>
                        <p>
                            You agree to indemnify and hold harmless Privacy-First Toolbox, its operators, and
                            affiliates from any claims, damages, or expenses arising from:
                        </p>
                        <ul>
                            <li>Your use of the Service</li>
                            <li>Your violation of these Terms</li>
                            <li>Your violation of any rights of third parties</li>
                            <li>Any content you process using our tools</li>
                        </ul>

                        <h2>8. Service Availability</h2>
                        <p>
                            We strive to maintain high availability but do not guarantee uninterrupted access.
                            We may:
                        </p>
                        <ul>
                            <li>Modify or discontinue any feature without notice</li>
                            <li>Perform maintenance that temporarily affects availability</li>
                            <li>Terminate the Service entirely at our discretion</li>
                        </ul>

                        <h2>9. Governing Law</h2>
                        <p>
                            These Terms shall be governed by and construed in accordance with applicable laws,
                            without regard to conflict of law principles. Any disputes arising from these Terms
                            or your use of the Service shall be resolved through appropriate legal channels.
                        </p>

                        <h2>10. Severability</h2>
                        <p>
                            If any provision of these Terms is found to be unenforceable, the remaining provisions
                            shall continue in full force and effect.
                        </p>

                        <h2>11. Contact</h2>
                        <p>
                            For questions about these Terms, please visit our <a href="/contact">Contact page</a>.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
