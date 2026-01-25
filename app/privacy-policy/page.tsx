import type { Metadata } from 'next';
import { Shield, Lock, Eye, Server, Github } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'Learn how Privacy-First Toolbox protects your data. All processing happens in your browser - we never upload, store, or access your files.',
    openGraph: {
        title: 'Privacy Policy | Privacy-First Toolbox',
        description: 'Learn how Privacy-First Toolbox protects your data. All processing happens in your browser.',
    },
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            {/* Hero Section */}
            <section className="relative py-16 sm:py-24">
                <div className="mx-auto max-w-4xl px-4 sm:px-6">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 mb-6">
                            <Shield className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                            Privacy Policy
                        </h1>
                        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                            Your privacy is our top priority. Learn how we protect your data and why our tools are designed to never access your files.
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

                        {/* Key Highlights */}
                        <div className="not-prose mb-12">
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="rounded-xl border bg-card p-6">
                                    <Lock className="h-8 w-8 text-green-600 mb-3" />
                                    <h3 className="font-semibold">No Data Upload</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Your files are processed entirely in your browser
                                    </p>
                                </div>
                                <div className="rounded-xl border bg-card p-6">
                                    <Eye className="h-8 w-8 text-blue-600 mb-3" />
                                    <h3 className="font-semibold">Anonymous Analytics</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        We use Google Analytics for anonymous usage statistics
                                    </p>
                                </div>
                                <div className="rounded-xl border bg-card p-6">
                                    <Server className="h-8 w-8 text-purple-600 mb-3" />
                                    <h3 className="font-semibold">No Storage</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        We never store your files on any server
                                    </p>
                                </div>
                            </div>
                        </div>

                        <h2>1. Introduction</h2>
                        <p>
                            Welcome to Privacy-First Toolbox. We are committed to protecting your privacy and ensuring
                            you have a positive experience when using our tools. This policy outlines our data handling
                            practices and your privacy rights.
                        </p>
                        <p>
                            Unlike traditional online tools, Privacy-First Toolbox is designed from the ground up with
                            privacy as the core principle. All file processing occurs directly in your web browser using
                            modern JavaScript APIs, meaning your files never leave your device.
                        </p>

                        <h2>2. Information We Do NOT Collect</h2>
                        <p>We want to be clear about what we do NOT collect:</p>
                        <ul>
                            <li><strong>Your Files:</strong> Images, documents, and other files you process are never uploaded to our servers</li>
                            <li><strong>File Contents:</strong> We have no access to the content of your files</li>
                            <li><strong>Personal Identifiers:</strong> We don&apos;t require accounts, emails, or personal information</li>
                            <li><strong>Browsing History:</strong> We don&apos;t track which tools you use or how often</li>
                        </ul>

                        <h2>3. Information We May Collect</h2>
                        <p>We use Google Analytics to collect anonymized information to improve our service:</p>
                        <ul>
                            <li><strong>Page Views:</strong> Which pages and tools are visited (anonymized)</li>
                            <li><strong>Usage Statistics:</strong> How users interact with our tools</li>
                            <li><strong>Device Information:</strong> Browser type, screen size, and operating system</li>
                            <li><strong>Geographic Region:</strong> Country-level location (not precise location)</li>
                            <li><strong>Referral Source:</strong> How you found our website</li>
                        </ul>
                        <p>
                            Google Analytics uses cookies to collect this information. The data is aggregated and
                            anonymized, and we have configured Google Analytics to anonymize IP addresses. This
                            information helps us understand which tools are popular and improve user experience.
                        </p>
                        <p>
                            <strong>Important:</strong> Google Analytics does NOT have access to the files you process.
                            Your files remain entirely in your browser and are never transmitted to Google or any other party.
                        </p>

                        <h2>4. How Our Tools Work</h2>
                        <p>
                            All Privacy-First Toolbox tools operate using client-side processing:
                        </p>
                        <ul>
                            <li>Files are loaded into your browser&apos;s memory</li>
                            <li>Processing occurs using Web Workers and Canvas APIs</li>
                            <li>Converted files are generated locally on your device</li>
                            <li>When you close the browser tab, all data is automatically cleared</li>
                        </ul>
                        <p>
                            This architecture ensures that your sensitive documents, personal photos, and confidential
                            files remain completely private.
                        </p>

                        <h2>5. Cookies and Local Storage</h2>
                        <p>We use cookies and local storage for the following purposes:</p>
                        <ul>
                            <li><strong>Theme Preferences:</strong> Remembering your light/dark mode preference</li>
                            <li><strong>Essential Functionality:</strong> Basic site operation requirements</li>
                            <li><strong>Analytics:</strong> Google Analytics cookies to understand website usage</li>
                        </ul>
                        <p>
                            For detailed information about the cookies we use, please see our <a href="/cookie-policy">Cookie Policy</a>.
                        </p>

                        <h2>6. Third-Party Services</h2>
                        <p>
                            Our website uses the following third-party services:
                        </p>
                        <ul>
                            <li><strong>Google Analytics:</strong> For understanding website usage and improving our services. Google Analytics collects anonymized data about page views, user interactions, and device information. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google&apos;s Privacy Policy</a></li>
                            <li><strong>Hosting Provider:</strong> For serving the website (no access to your processed files)</li>
                            <li><strong>CDN:</strong> For faster content delivery (serves static assets only)</li>
                        </ul>
                        <p>
                            <strong>Important:</strong> While we use Google Analytics for website analytics, your files are NEVER
                            uploaded or shared with any third party. All file processing happens entirely in your browser.
                        </p>

                        <h2>7. Data Security</h2>
                        <p>
                            Security is built into our architecture:
                        </p>
                        <ul>
                            <li>HTTPS encryption for all website traffic</li>
                            <li>No server-side file storage means no data breaches of your files are possible</li>
                            <li>Regular security audits of our code</li>
                            <li>Open-source codebase for transparency</li>
                        </ul>

                        <h2>8. Children&apos;s Privacy</h2>
                        <p>
                            Our service is not directed at children under 13. We do not knowingly collect any
                            information from children. Since our tools don&apos;t require accounts or collect personal
                            information, this risk is minimized.
                        </p>

                        <h2>9. Your Rights</h2>
                        <p>You have the right to:</p>
                        <ul>
                            <li>Use our tools without providing any personal information</li>
                            <li>Clear your browser data at any time to remove any local preferences</li>
                            <li>Contact us with any privacy concerns or questions</li>
                        </ul>

                        <h2>10. Changes to This Policy</h2>
                        <p>
                            We may update this privacy policy from time to time. We will notify you of any changes
                            by posting the new policy on this page and updating the &quot;Last updated&quot; date.
                        </p>

                        <h2>11. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please reach out through GitHub:
                        </p>
                        <div className="not-prose mt-4">
                            <a
                                href="https://github.com/varundeva/privacy-first/issues"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                            >
                                <Github className="h-4 w-4" />
                                Open an Issue on GitHub
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
