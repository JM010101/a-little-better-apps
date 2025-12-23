import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    const { data: apps, error } = await supabase
      .from('apps')
      .select(`
        *,
        category:app_categories(*)
      `)
      .eq('status', 'published')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,short_description.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error

    // Get ratings for apps
    const appIds = apps?.map(a => a.id) || []
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

      apps?.forEach(app => {
        const ratingData = ratingsMap.get(app.id)
        if (ratingData) {
          app.average_rating = ratingData.sum / ratingData.count
          app.rating_count = ratingData.count
        }
      })
    }

    return NextResponse.json({ apps: apps || [] })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

