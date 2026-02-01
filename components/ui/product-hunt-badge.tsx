'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface ProductHuntBadgeProps {
    size?: 'small' | 'medium' | 'large';
    className?: string;
}

export function ProductHuntBadge({ size = 'medium', className = '' }: ProductHuntBadgeProps) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Size mappings
    const sizeMap = {
        small: { width: 200, height: 43 },
        medium: { width: 250, height: 54 },
        large: { width: 300, height: 65 },
    };

    const { width, height } = sizeMap[size];

    // Show a placeholder with proper dimensions during SSR to prevent layout shift
    if (!mounted) {
        return (
            <div
                className={`inline-block animate-pulse rounded-lg bg-muted ${className}`}
                style={{ width, height }}
                aria-label="Loading Product Hunt badge"
            />
        );
    }

    const theme = resolvedTheme === 'dark' ? 'dark' : 'light';
    const timestamp = theme === 'dark' ? '1769934371453' : '1769934290138';

    return (
        <a
            href="https://www.producthunt.com/products/privacy-first-tools-free-and-private?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-privacy-first-tools-free-and-private"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-block transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-lg ${className}`}
        >
            <img
                src={`https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1070935&theme=${theme}&t=${timestamp}`}
                alt="Privacy First Tools - Free and Private - Free online tools for images, PDFs & more - 100% private | Product Hunt"
                width={width}
                height={height}
                className="block"
                loading="eager"
            />
        </a>
    );
}
