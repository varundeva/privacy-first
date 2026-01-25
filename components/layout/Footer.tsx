'use client';

import Link from 'next/link';
import { Shield, Heart, Github, ExternalLink } from 'lucide-react';
import { toolsConfig } from '@/lib/tools-config';

// Most viral/popular tools based on search volume
const viralTools = [
  { name: 'JPG to PNG', href: '/tools/image/jpg-to-png', hot: true },
  { name: 'PNG to JPG', href: '/tools/image/png-to-jpg', hot: true },
  { name: 'WebP to PNG', href: '/tools/image/webp-to-png' },
  { name: 'WebP to JPG', href: '/tools/image/webp-to-jpg' },
  { name: 'PDF Compressor', href: '/tools/pdf/pdf-compress', hot: true },
  { name: 'Merge PDF', href: '/tools/pdf/pdf-merge' },
];

// SEO keyword-rich tool categories
const imageConverters = [
  { name: 'JPG to WebP', href: '/tools/image/jpg-to-webp' },
  { name: 'PNG to WebP', href: '/tools/image/png-to-webp' },
  { name: 'SVG to PNG', href: '/tools/image/svg-to-png' },
  { name: 'GIF to PNG', href: '/tools/image/gif-to-png' },
  { name: 'BMP to PNG', href: '/tools/image/bmp-to-png' },
  { name: 'ICO to PNG', href: '/tools/image/ico-to-png' },
];

const pdfTools = [
  { name: 'PDF to PNG', href: '/tools/pdf/pdf-to-png' },
  { name: 'PDF to JPG', href: '/tools/pdf/pdf-to-jpg' },
  { name: 'Split PDF', href: '/tools/pdf/pdf-split' },
  { name: 'Rotate PDF', href: '/tools/pdf/pdf-rotate' },
  { name: 'Unlock PDF', href: '/tools/pdf/pdf-unlock' },
  { name: 'PDF Metadata', href: '/tools/pdf/pdf-metadata' },
];

const developerTools = [
  { name: 'JSON Formatter', href: '/tools/json/json-formatter' },
  { name: 'JSON to CSV', href: '/tools/json/json-to-csv' },
  { name: 'JSON to TypeScript', href: '/tools/json/json-to-typescript' },
  { name: 'Image to Base64', href: '/tools/image/image-to-base64' },
  { name: 'Base64 to Image', href: '/tools/image/base64-to-image' },
  { name: 'MD5 Generator', href: '/tools/crypto/md5-generator' },
];

const textTools = [
  { name: 'Word Counter', href: '/tools/text/word-counter' },
  { name: 'Case Converter', href: '/tools/text/case-converter' },
  { name: 'Text Diff', href: '/tools/text/text-diff' },
  { name: 'Lorem Ipsum', href: '/tools/text/lorem-ipsum' },
  { name: 'Text to Slug', href: '/tools/text/text-to-slug' },
];

const dateTools = [
  { name: 'Unix Timestamp', href: '/tools/date/unix-timestamp' },
  { name: 'Age Calculator', href: '/tools/date/age-calculator' },
  { name: 'Time Zone Converter', href: '/tools/date/time-zone-converter' },
];

const companyLinks = [
  { name: 'About Us', href: '/about' },
  { name: 'Contact', href: '/contact' },
  { name: 'Privacy Policy', href: '/privacy-policy' },
  { name: 'Terms of Service', href: '/terms-of-service' },
  { name: 'Cookie Policy', href: '/cookie-policy' },
  { name: 'Credits', href: '/credits' },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-6">
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
                <span className="font-medium">{toolsConfig.length}+</span> Free Tools
              </div>
            </div>

            {/* GitHub Link */}
            <a
              href="https://github.com/varundeva/privacy-first"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-4 w-4" />
              Open Source on GitHub
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Popular Tools - Most Searched */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              🔥 Popular Tools
            </h3>
            <ul className="mt-4 space-y-2">
              {viralTools.map((tool) => (
                <li key={tool.name}>
                  <Link
                    href={tool.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                  >
                    {tool.name}
                    {tool.hot && <span className="text-[10px] bg-red-500 text-white px-1 rounded">HOT</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Image Converters */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Image Converters
            </h3>
            <ul className="mt-4 space-y-2">
              {imageConverters.map((tool) => (
                <li key={tool.name}>
                  <Link
                    href={tool.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* PDF Tools */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              PDF Tools
            </h3>
            <ul className="mt-4 space-y-2">
              {pdfTools.map((tool) => (
                <li key={tool.name}>
                  <Link
                    href={tool.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Developer & Text Tools */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
              Developer Tools
            </h3>
            <ul className="mt-4 space-y-2">
              {developerTools.slice(0, 4).map((tool) => (
                <li key={tool.name}>
                  <Link
                    href={tool.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-foreground">
              Text Tools
            </h3>
            <ul className="mt-4 space-y-2">
              {textTools.slice(0, 3).map((tool) => (
                <li key={tool.name}>
                  <Link
                    href={tool.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* SEO Keywords Section - Quick Access to All Tool Types */}
        <div className="mt-12 pt-8 border-t">
          <h3 className="text-sm font-semibold text-center mb-6">Quick Links by Format</h3>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/tools?from=jpg" className="px-3 py-1 text-xs rounded-full bg-muted hover:bg-muted/80 transition-colors">Convert JPG</Link>
            <Link href="/tools?from=png" className="px-3 py-1 text-xs rounded-full bg-muted hover:bg-muted/80 transition-colors">Convert PNG</Link>
            <Link href="/tools?from=webp" className="px-3 py-1 text-xs rounded-full bg-muted hover:bg-muted/80 transition-colors">Convert WebP</Link>
            <Link href="/tools?from=gif" className="px-3 py-1 text-xs rounded-full bg-muted hover:bg-muted/80 transition-colors">Convert GIF</Link>
            <Link href="/tools?from=svg" className="px-3 py-1 text-xs rounded-full bg-muted hover:bg-muted/80 transition-colors">Convert SVG</Link>
            <Link href="/tools?from=bmp" className="px-3 py-1 text-xs rounded-full bg-muted hover:bg-muted/80 transition-colors">Convert BMP</Link>
            <Link href="/tools?to=png" className="px-3 py-1 text-xs rounded-full bg-muted hover:bg-muted/80 transition-colors">To PNG</Link>
            <Link href="/tools?to=jpg" className="px-3 py-1 text-xs rounded-full bg-muted hover:bg-muted/80 transition-colors">To JPG</Link>
            <Link href="/tools?to=webp" className="px-3 py-1 text-xs rounded-full bg-muted hover:bg-muted/80 transition-colors">To WebP</Link>
            <Link href="/tools?category=pdf" className="px-3 py-1 text-xs rounded-full bg-muted hover:bg-muted/80 transition-colors">PDF Tools</Link>
            <Link href="/tools?category=text" className="px-3 py-1 text-xs rounded-full bg-muted hover:bg-muted/80 transition-colors">Text Tools</Link>
            <Link href="/tools?category=json" className="px-3 py-1 text-xs rounded-full bg-muted hover:bg-muted/80 transition-colors">JSON Tools</Link>
            <Link href="/tools?category=date" className="px-3 py-1 text-xs rounded-full bg-muted hover:bg-muted/80 transition-colors">Date Tools</Link>
            <Link href="/tools?category=crypto" className="px-3 py-1 text-xs rounded-full bg-muted hover:bg-muted/80 transition-colors">Crypto Tools</Link>
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
                Compress and manipulate PDFs. Format JSON, convert timestamps, and more.
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
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Privacy-First Toolbox. All rights reserved.
            </p>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              {companyLinks.map((link, index) => (
                <span key={link.name} className="flex items-center gap-4">
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                  {index < companyLinks.length - 1 && (
                    <span className="text-muted-foreground/50 hidden sm:inline">•</span>
                  )}
                </span>
              ))}
            </div>

            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              Made with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> for privacy
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
