import { MetadataRoute } from 'next'
import { toolsConfig, toolCategories } from '@/lib/tools-config'
import { competitorsData } from '@/lib/alternatives-data'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://privacyfirst.tools'
const LAST_MODIFIED = new Date('2026-03-01T00:00:00.000Z')

export default function sitemap(): MetadataRoute.Sitemap {
    // Base routes
    const routes = [
        '',
        '/tools',
        '/alternatives',
        '/about',
        '/contact',
        '/privacy-policy',
        '/terms-of-service',
        '/cookie-policy',
        '/credits',
    ].map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: LAST_MODIFIED,
        changeFrequency: (route === '' ? 'daily' : route === '/tools' ? 'daily' : 'monthly') as 'daily' | 'monthly',
        priority: route === '' ? 1 : route === '/tools' ? 0.9 : route === '/alternatives' ? 0.85 : route === '/about' ? 0.7 : 0.5,
    }))

    // Category hub routes
    const categoryRoutes = toolCategories.map((cat) => ({
        url: `${BASE_URL}/tools/${cat.id}`,
        lastModified: LAST_MODIFIED,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    // Alternative comparison routes
    const alternativeRoutes = Object.keys(competitorsData).map((slug) => ({
        url: `${BASE_URL}/alternatives/${slug}`,
        lastModified: LAST_MODIFIED,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    // Tool specific routes generated from config
    const toolRoutes = toolsConfig.map((tool) => ({
        url: `${BASE_URL}/tools/${tool.category}/${tool.slug}`,
        lastModified: LAST_MODIFIED,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    return [...routes, ...categoryRoutes, ...alternativeRoutes, ...toolRoutes]
}
