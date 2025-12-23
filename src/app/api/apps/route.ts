import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { slugify } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const searchParams = request.nextUrl.searchParams
    
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
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

    if (category) {
      query = query.eq('category_id', category)
    }

    if (featured === 'true') {
      query = query.eq('featured', true)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,short_description.ilike.%${search}%`)
    }

    const { data, error, count } = await query

    if (error) throw error

    // Get ratings for apps
    const appIds = data?.map(a => a.id) || []
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

      data?.forEach(app => {
        const ratingData = ratingsMap.get(app.id)
        if (ratingData) {
          app.average_rating = ratingData.sum / ratingData.count
          app.rating_count = ratingData.count
        }
      })
    }

    return NextResponse.json({
      apps: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, short_description, icon_url, screenshot_urls, app_url, category_id, developer, version, featured, status } = body

    if (!name || !description || !app_url) {
      return NextResponse.json(
        { error: 'Name, description, and app_url are required' },
        { status: 400 }
      )
    }

    const slug = slugify(name)

    // Check if slug exists
    const { data: existingApp } = await supabase
      .from('apps')
      .select('id')
      .eq('slug', slug)
      .single()

    let finalSlug = slug
    if (existingApp) {
      finalSlug = `${slug}-${Date.now()}`
    }

    const appData: any = {
      name,
      slug: finalSlug,
      description,
      short_description: short_description || null,
      icon_url: icon_url || null,
      screenshot_urls: screenshot_urls || null,
      app_url,
      category_id: category_id || null,
      developer: developer || user.id,
      version: version || null,
      status: status || 'draft',
      featured: featured || false,
    }

    const { data: app, error: appError } = await supabase
      .from('apps')
      .insert(appData)
      .select(`
        *,
        category:app_categories(*)
      `)
      .single()

    if (appError) throw appError

    return NextResponse.json({ app }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

