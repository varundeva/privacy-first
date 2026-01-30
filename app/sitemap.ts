import { MetadataRoute } from 'next'
import { toolsConfig } from '@/lib/tools-config'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://privacyfirst.tools')

export default function sitemap(): MetadataRoute.Sitemap {
    // Base routes
    const routes = [
        '',
        '/tools',
        '/about',
        '/contact',
        '/privacy-policy',
        '/terms-of-service',
        '/cookie-policy',
        '/credits',
    ].map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: (route === '' ? 'daily' : route === '/tools' ? 'daily' : 'monthly') as 'daily' | 'monthly',
        priority: route === '' ? 1 : route === '/tools' ? 0.9 : route === '/about' ? 0.7 : 0.5,
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
