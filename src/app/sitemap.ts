import { MetadataRoute } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://apps.a-little-better.com'
  
  const supabase = await createServerSupabaseClient()
  
  // Get all published apps
  const { data: apps } = await supabase
    .from('apps')
    .select('slug, updated_at')
    .eq('status', 'published')

  const appEntries = (apps || []).map((app) => ({
    url: `${baseUrl}/app/${app.slug}`,
    lastModified: new Date(app.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...appEntries,
  ]
}

