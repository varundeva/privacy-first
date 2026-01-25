'use client';

import Link from 'next/link';
import { Shield, Heart, ExternalLink, Image, ArrowRight } from 'lucide-react';
import { toolsConfig } from '@/lib/tools-config';

// Group tools by output format for SEO-friendly linking
const popularTools = [
  { name: 'JPG to PNG', href: '/tools/image/jpg-to-png' },
  { name: 'PNG to JPG', href: '/tools/image/png-to-jpg' },
  { name: 'WebP to PNG', href: '/tools/image/webp-to-png' },
  { name: 'SVG to PNG', href: '/tools/image/svg-to-png' },
  { name: 'GIF to PNG', href: '/tools/image/gif-to-png' },
  { name: 'JPG to WebP', href: '/tools/image/jpg-to-webp' },
];

const convertersByInput = [
  { name: 'Convert JPG Files', href: '/tools?from=jpg', description: 'JPG/JPEG converters' },
  { name: 'Convert PNG Files', href: '/tools?from=png', description: 'PNG converters' },
  { name: 'Convert WebP Files', href: '/tools?from=webp', description: 'WebP converters' },
  { name: 'Convert GIF Files', href: '/tools?from=gif', description: 'GIF converters' },
  { name: 'Convert SVG Files', href: '/tools?from=svg', description: 'SVG converters' },
  { name: 'Convert BMP Files', href: '/tools?from=bmp', description: 'BMP converters' },
];

const convertersByOutput = [
  { name: 'Convert to PNG', href: '/tools?to=png', description: 'Get PNG output' },
  { name: 'Convert to JPG', href: '/tools?to=jpg', description: 'Get JPG output' },
  { name: 'Convert to WebP', href: '/tools?to=webp', description: 'Get WebP output' },
];

const resources = [
  { name: 'All Tools', href: '/tools' },
  { name: 'Image Tools', href: '/tools?category=image' },
  { name: 'About Us', href: '/about' },
  { name: 'How It Works', href: '/#how-it-works' },
];

const legalLinks = [
  { name: 'Privacy Policy', href: '/privacy-policy' },
  { name: 'Terms of Service', href: '/terms-of-service' },
  { name: 'Cookie Policy', href: '/cookie-policy' },
  { name: 'Contact Us', href: '/contact' },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold">Privacy-First</span>
                <span className="text-xl font-light text-muted-foreground ml-1">Toolbox</span>
              </div>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-md">
              Free online tools that process your files entirely in your browser.
              Your data never leaves your device. No uploads, no tracking, no accounts required.
            </p>

            {/* Trust Badges */}
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1 text-xs text-green-700 dark:text-green-400">
                <Shield className="h-3 w-3" />
                100% Private
              </div>
              <div className="flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs text-blue-700 dark:text-blue-400">
                <Image className="h-3 w-3" />
                {toolsConfig.length} Free Tools
              </div>
            </div>
          </div>

          {/* Popular Tools */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Popular Tools
            </h3>
            <ul className="mt-4 space-y-2">
              {popularTools.map((tool) => (
                <li key={tool.name}>
                  <Link
                    href={tool.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group"
                  >
                    {tool.name}
                    <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Convert From */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Convert From
            </h3>
            <ul className="mt-4 space-y-2">
              {convertersByInput.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Convert To & Resources */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Convert To
            </h3>
            <ul className="mt-4 space-y-2">
              {convertersByOutput.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-foreground">
              Resources
            </h3>
            <ul className="mt-4 space-y-2">
              {resources.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-foreground">
              Legal
            </h3>
            <ul className="mt-4 space-y-2">
              {legalLinks.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* SEO Content Section */}
        <div className="mt-12 pt-8 border-t">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <h4 className="font-semibold text-sm">Why Browser-Based?</h4>
              <p className="mt-2 text-xs text-muted-foreground">
                Our tools use modern Web Workers and Canvas APIs to process files directly in your browser.
                This means your sensitive images and documents never leave your device, ensuring complete privacy.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm">Supported Formats</h4>
              <p className="mt-2 text-xs text-muted-foreground">
                Convert between JPG, PNG, WebP, GIF, BMP, SVG, and ICO formats.
                Our image converters preserve quality while optimizing file sizes for web, email, and print.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm">Works Offline</h4>
              <p className="mt-2 text-xs text-muted-foreground">
                Once loaded, our tools work without an internet connection.
                Perfect for handling sensitive documents or working in areas with limited connectivity.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Privacy-First Toolbox. All rights reserved.
            </p>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              Made with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> for privacy
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
