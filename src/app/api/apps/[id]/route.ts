import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { slugify } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: app, error } = await supabase
      .from('apps')
      .select(`
        *,
        category:app_categories(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    // Only show published apps unless user is the developer
    if (app.status !== 'published' && app.developer !== user?.id) {
      return NextResponse.json(
        { error: 'App not found' },
        { status: 404 }
      )
    }

    // Increment download_count (or view_count)
    await supabase
      .from('apps')
      .update({ download_count: app.download_count + 1 })
      .eq('id', id)

    // Get ratings
    const { data: ratings } = await supabase
      .from('app_ratings')
      .select('rating, user_id, review')
      .eq('app_id', id)

    if (ratings && ratings.length > 0) {
      const sum = ratings.reduce((acc, r) => acc + r.rating, 0)
      app.average_rating = sum / ratings.length
      app.rating_count = ratings.length
      
      if (user) {
        const userRating = ratings.find(r => r.user_id === user.id)
        app.user_rating = userRating?.rating
        app.user_review = userRating?.review
      }
    }

    return NextResponse.json({ app })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user owns the app
    const { data: existingApp } = await supabase
      .from('apps')
      .select('developer')
      .eq('id', id)
      .single()

    if (!existingApp || existingApp.developer !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, short_description, icon_url, screenshot_urls, app_url, category_id, developer, version, featured, status } = body

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (name) {
      updateData.name = name
      const slug = slugify(name)
      const { data: existingSlug } = await supabase
        .from('apps')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .single()
      
      if (!existingSlug) {
        updateData.slug = slug
      }
    }
    if (description !== undefined) updateData.description = description
    if (short_description !== undefined) updateData.short_description = short_description
    if (icon_url !== undefined) updateData.icon_url = icon_url
    if (screenshot_urls !== undefined) updateData.screenshot_urls = screenshot_urls
    if (app_url !== undefined) updateData.app_url = app_url
    if (category_id !== undefined) updateData.category_id = category_id
    if (developer !== undefined) updateData.developer = developer
    if (version !== undefined) updateData.version = version
    if (featured !== undefined) updateData.featured = featured
    if (status !== undefined) updateData.status = status

    const { data: app, error } = await supabase
      .from('apps')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        category:app_categories(*)
      `)
      .single()

    if (error) throw error

    return NextResponse.json({ app })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user owns the app
    const { data: existingApp } = await supabase
      .from('apps')
      .select('developer')
      .eq('id', id)
      .single()

    if (!existingApp || existingApp.developer !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('apps')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

