'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Shield,
  Menu,
  Image,
  FileText,
  Type,
  Video,
  Music,
  Home,
  Wrench,
  Github,
} from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'All Tools', href: '/tools', icon: Wrench },
];

const toolCategories = [
  { name: 'Image Tools', href: '/tools?category=image', icon: Image, count: 16 },
  { name: 'PDF Tools', href: '/tools?category=pdf', icon: FileText, count: 0 },
  { name: 'Text Tools', href: '/tools?category=text', icon: Type, count: 0 },
  { name: 'Video Tools', href: '/tools?category=video', icon: Video, count: 0 },
  { name: 'Audio Tools', href: '/tools?category=audio', icon: Music, count: 0 },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold">Privacy-First</span>
              <span className="text-lg font-light text-muted-foreground ml-1">Toolbox</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="sm"
                    className="gap-2"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
            
            {/* Tools Dropdown - Simple hover for now */}
            <div className="relative group">
              <Button variant="ghost" size="sm" className="gap-2">
                <Image className="h-4 w-4" />
                Categories
              </Button>
              <div className="absolute top-full left-0 hidden group-hover:block pt-2">
                <div className="w-56 rounded-lg border bg-popover p-2 shadow-lg">
                  {toolCategories.map((category) => (
                    <Link key={category.name} href={category.href}>
                      <div className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors">
                        <span className="flex items-center gap-2">
                          <category.icon className="h-4 w-4 text-muted-foreground" />
                          {category.name}
                        </span>
                        {category.count > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {category.count}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* GitHub Link */}
            <Button variant="ghost" size="icon" className="hidden sm:flex h-9 w-9" asChild>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </a>
            </Button>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col gap-6 pt-6">
                  {/* Logo in Mobile */}
                  <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-bold">Privacy-First Toolbox</span>
                  </Link>

                  {/* Main Navigation */}
                  <div className="space-y-1">
                    <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Navigation
                    </p>
                    {navigation.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link 
                          key={item.name} 
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <div className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                            isActive ? 'bg-muted' : 'hover:bg-muted'
                          }`}>
                            <item.icon className="h-5 w-5" />
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Tool Categories */}
                  <div className="space-y-1">
                    <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Tool Categories
                    </p>
                    {toolCategories.map((category) => (
                      <Link 
                        key={category.name} 
                        href={category.href}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <div className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted transition-colors">
                          <span className="flex items-center gap-3">
                            <category.icon className="h-5 w-5 text-muted-foreground" />
                            <span>{category.name}</span>
                          </span>
                          {category.count > 0 && (
                            <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                              {category.count}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Privacy Badge */}
                  <div className="mt-auto rounded-lg bg-muted p-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="font-medium">100% Private</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      All tools process files in your browser. Nothing is uploaded to any server.
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
