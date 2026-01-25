import type { Metadata } from 'next';
import { Cookie, CheckCircle, XCircle, Settings } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Cookie Policy',
    description: 'Learn about the minimal cookies used by Privacy-First Toolbox. We only use essential cookies for basic functionality.',
    openGraph: {
        title: 'Cookie Policy | Privacy-First Toolbox',
        description: 'Learn about the minimal cookies used by Privacy-First Toolbox.',
    },
};

export default function CookiePolicyPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            {/* Hero Section */}
            <section className="relative py-16 sm:py-24">
                <div className="mx-auto max-w-4xl px-4 sm:px-6">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mb-6">
                            <Cookie className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                            Cookie Policy
                        </h1>
                        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                            We believe in minimal data collection. Here&apos;s everything you need to know about our cookie usage.
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

                        {/* Cookie Summary */}
                        <div className="not-prose mb-12">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="rounded-xl border bg-card p-6">
                                    <h3 className="font-semibold flex items-center gap-2 mb-4 text-green-600">
                                        <CheckCircle className="h-5 w-5" />
                                        What We Use
                                    </h3>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        <li>• Theme preference (light/dark mode)</li>
                                        <li>• Essential session cookies</li>
                                        <li>• Google Analytics (anonymized)</li>
                                        <li>• Local storage for UI state</li>
                                    </ul>
                                </div>
                                <div className="rounded-xl border bg-card p-6">
                                    <h3 className="font-semibold flex items-center gap-2 mb-4 text-red-600">
                                        <XCircle className="h-5 w-5" />
                                        What We Don&apos;t Use
                                    </h3>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        <li>• Advertising cookies</li>
                                        <li>• Cross-site tracking</li>
                                        <li>• Social media trackers</li>
                                        <li>• Personalized advertising</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <h2>What Are Cookies?</h2>
                        <p>
                            Cookies are small text files stored on your device when you visit websites. They help
                            websites remember your preferences and improve your experience. However, they can also
                            be used for tracking and advertising, which is something we actively avoid.
                        </p>

                        <h2>Our Approach to Cookies</h2>
                        <p>
                            Privacy-First Toolbox uses cookies for essential functionality and anonymous analytics.
                            We use Google Analytics to understand how visitors use our website, which helps us improve
                            our tools and user experience. We do not use cookies for:
                        </p>
                        <ul>
                            <li>Building advertising profiles</li>
                            <li>Personalized advertising</li>
                            <li>Selling data to third parties</li>
                            <li>Tracking you across other websites</li>
                        </ul>

                        <h2>Cookies We Use</h2>

                        <h3>Essential Cookies</h3>
                        <div className="not-prose my-4">
                            <div className="rounded-lg border overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium">Cookie Name</th>
                                            <th className="px-4 py-3 text-left font-medium">Purpose</th>
                                            <th className="px-4 py-3 text-left font-medium">Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        <tr>
                                            <td className="px-4 py-3 font-mono text-xs">theme</td>
                                            <td className="px-4 py-3">Stores your light/dark mode preference</td>
                                            <td className="px-4 py-3">1 year</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <h3>Analytics Cookies (Google Analytics)</h3>
                        <p>We use Google Analytics to collect anonymous information about how visitors use our website.</p>
                        <div className="not-prose my-4">
                            <div className="rounded-lg border overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium">Cookie Name</th>
                                            <th className="px-4 py-3 text-left font-medium">Purpose</th>
                                            <th className="px-4 py-3 text-left font-medium">Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        <tr>
                                            <td className="px-4 py-3 font-mono text-xs">_ga</td>
                                            <td className="px-4 py-3">Distinguishes unique users (anonymized)</td>
                                            <td className="px-4 py-3">2 years</td>
                                        </tr>
                                        <tr>
                                            <td className="px-4 py-3 font-mono text-xs">_ga_*</td>
                                            <td className="px-4 py-3">Maintains session state</td>
                                            <td className="px-4 py-3">2 years</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <p>
                            <strong>Note:</strong> We have configured Google Analytics with IP anonymization enabled,
                            meaning your full IP address is never stored. The analytics data helps us understand
                            which tools are popular and how to improve the user experience.
                        </p>

                        <h3>Local Storage</h3>
                        <p>
                            In addition to cookies, we use browser local storage to remember:
                        </p>
                        <ul>
                            <li>Your theme preference (light/dark mode)</li>
                            <li>Any UI preferences you set</li>
                        </ul>
                        <p>
                            Local storage data never leaves your browser and is not accessible by us or any
                            third parties.
                        </p>

                        <h2>Third-Party Cookies</h2>
                        <p>
                            We use Google Analytics as our only third-party service that sets cookies. We do NOT use:
                        </p>
                        <ul>
                            <li>Facebook Pixel or social media trackers</li>
                            <li>Advertising network scripts</li>
                            <li>Remarketing or retargeting cookies</li>
                            <li>Any other third-party tracking services</li>
                        </ul>
                        <p>
                            For more information about how Google handles data, visit{' '}
                            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google&apos;s Privacy Policy</a>.
                        </p>

                        <h3>Opting Out of Google Analytics</h3>
                        <p>
                            If you prefer not to be tracked by Google Analytics, you can:
                        </p>
                        <ul>
                            <li>Install the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a></li>
                            <li>Use your browser&apos;s private/incognito mode</li>
                            <li>Disable cookies in your browser settings</li>
                        </ul>

                        <h2>Managing Cookies</h2>
                        <p>
                            You can control cookies through your browser settings:
                        </p>

                        <div className="not-prose my-6">
                            <div className="rounded-xl border bg-card p-6">
                                <h4 className="font-semibold flex items-center gap-2 mb-4">
                                    <Settings className="h-5 w-5 text-primary" />
                                    Browser Cookie Settings
                                </h4>
                                <ul className="space-y-2 text-sm">
                                    <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
                                    <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies</li>
                                    <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                                    <li><strong>Edge:</strong> Settings → Cookies and Site Permissions</li>
                                </ul>
                            </div>
                        </div>

                        <p>
                            Please note that disabling cookies may affect some functionality, such as
                            remembering your theme preference.
                        </p>

                        <h2>Changes to This Policy</h2>
                        <p>
                            We may update this Cookie Policy occasionally. Any changes will be posted on this
                            page with an updated revision date.
                        </p>

                        <h2>Contact Us</h2>
                        <p>
                            If you have questions about our cookie practices, please visit our{' '}
                            <a href="/contact">Contact page</a>.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
