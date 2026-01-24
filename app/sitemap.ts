import { MetadataRoute } from 'next'
import { toolsConfig } from '@/lib/tools-config'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://example.com')

export default function sitemap(): MetadataRoute.Sitemap {
    // Base routes
    const routes = [
        '',
        '/tools',
    ].map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }))

    // Tool specific routes generated from config
    const toolRoutes = toolsConfig.map((tool) => ({
        url: `${BASE_URL}/tools/${tool.category}/${tool.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
    }))

    return [...routes, ...toolRoutes]
}
