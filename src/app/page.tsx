import { createServerSupabaseClient } from '@/lib/supabase'
import { HomePageClient } from './page-client'
import { App } from '@/types/app'
import { AppCategory } from '@/types/app'

interface HomePageProps {
  searchParams: Promise<{
    category?: string
    search?: string
    featured?: string
    page?: string
  }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams
  const supabase = await createServerSupabaseClient()

  // Fetch categories
  const { data: categoriesData } = await supabase
    .from('app_categories')
    .select('*')
    .order('name', { ascending: true })

  const categories: AppCategory[] = categoriesData || []

  // Fetch apps directly from Supabase
  const page = parseInt(params.page || '1')
  const limit = 12
  const offset = (page - 1) * limit

  let query = supabase
    .from('apps')
    .select(`
      *,
      category:app_categories(*)
    `, { count: 'exact' })
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (params.category) {
    query = query.eq('category_id', params.category)
  }

  if (params.featured === 'true') {
    query = query.eq('featured', true)
  }

  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%,short_description.ilike.%${params.search}%`)
  }

  const { data: appsData, error, count } = await query
  if (error) throw error

  const apps: App[] = appsData || []
  const total = count || 0
  const totalPages = Math.ceil(total / limit)

  // Get ratings for apps
  const appIds = apps.map(a => a.id)
  if (appIds.length > 0) {
    const { data: ratings } = await supabase
      .from('app_ratings')
      .select('app_id, rating')
      .in('app_id', appIds)

    const ratingsMap = new Map<string, { sum: number; count: number }>()
    ratings?.forEach(r => {
      const existing = ratingsMap.get(r.app_id) || { sum: 0, count: 0 }
      ratingsMap.set(r.app_id, {
        sum: existing.sum + r.rating,
        count: existing.count + 1
      })
    })

    apps.forEach(app => {
      const ratingData = ratingsMap.get(app.id)
      if (ratingData) {
        app.average_rating = ratingData.sum / ratingData.count
        app.rating_count = ratingData.count
      }
    })
  }

  const pagination = {
    page,
    limit,
    total,
    totalPages,
  }

  // Fetch featured apps
  const { data: featuredData } = await supabase
    .from('apps')
    .select(`
      *,
      category:app_categories(*)
    `)
    .eq('status', 'published')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(6)

  const featuredApps: App[] = featuredData || []

  // Get ratings for featured apps
  if (featuredApps.length > 0) {
    const featuredAppIds = featuredApps.map(a => a.id)
    const { data: featuredRatings } = await supabase
      .from('app_ratings')
      .select('app_id, rating')
      .in('app_id', featuredAppIds)

    const ratingsMap = new Map<string, { sum: number; count: number }>()
    featuredRatings?.forEach(r => {
      const existing = ratingsMap.get(r.app_id) || { sum: 0, count: 0 }
      ratingsMap.set(r.app_id, {
        sum: existing.sum + r.rating,
        count: existing.count + 1
      })
    })

    featuredApps.forEach(app => {
      const ratingData = ratingsMap.get(app.id)
      if (ratingData) {
        app.average_rating = ratingData.sum / ratingData.count
        app.rating_count = ratingData.count
      }
    })
  }

  return (
    <div className="container-custom py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          A Little Better App Store
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover and explore apps from the A Little Better ecosystem.
        </p>
      </div>

      <HomePageClient
        initialApps={apps}
        initialFeaturedApps={featuredApps}
        categories={categories}
        initialPagination={pagination}
      />
    </div>
  )
}

