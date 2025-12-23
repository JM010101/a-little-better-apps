import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'
import { RatingForm } from '@/components/app/RatingForm'
import { AppGrid } from '@/components/app/AppGrid'
import { Button } from '@/components/ui/Button'
import { ExternalLink, Download, Star } from 'lucide-react'
import { App } from '@/types/app'
import type { Metadata } from 'next'
import Script from 'next/script'

interface AppDetailPageProps {
  params: Promise<{ slug: string }>
}

async function getApp(slug: string): Promise<App | null> {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: app, error } = await supabase
    .from('apps')
    .select(`
      *,
      category:app_categories(*)
    `)
    .eq('slug', slug)
    .single()

  if (error || !app) return null

  // Only show published apps unless user is the developer
  if (app.status !== 'published' && app.developer !== user?.id) {
    return null
  }

  // Get ratings
  const { data: ratings } = await supabase
    .from('app_ratings')
    .select('rating, user_id, review')
    .eq('app_id', app.id)

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

  return app
}

export async function generateMetadata({ params }: AppDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const app = await getApp(slug)

  if (!app) {
    return {
      title: 'App Not Found',
    }
  }

  return {
    title: app.name,
    description: app.short_description || app.description,
    openGraph: {
      title: app.name,
      description: app.short_description || app.description,
      images: app.icon_url ? [app.icon_url] : [],
    },
  }
}

export default async function AppDetailPage({ params }: AppDetailPageProps) {
  const { slug } = await params
  const app = await getApp(slug)

  if (!app) {
    notFound()
  }

  const supabase = await createServerSupabaseClient()

  // Get related apps (same category)
  const { data: relatedApps } = await supabase
    .from('apps')
    .select(`
      *,
      category:app_categories(*)
    `)
    .eq('status', 'published')
    .eq('category_id', app.category_id)
    .neq('id', app.id)
    .limit(6)

  // Get ratings for related apps
  if (relatedApps && relatedApps.length > 0) {
    const relatedAppIds = relatedApps.map(a => a.id)
    const { data: relatedRatings } = await supabase
      .from('app_ratings')
      .select('app_id, rating')
      .in('app_id', relatedAppIds)

    const ratingsMap = new Map<string, { sum: number; count: number }>()
    relatedRatings?.forEach(r => {
      const existing = ratingsMap.get(r.app_id) || { sum: 0, count: 0 }
      ratingsMap.set(r.app_id, {
        sum: existing.sum + r.rating,
        count: existing.count + 1
      })
    })

    relatedApps.forEach(app => {
      const ratingData = ratingsMap.get(app.id)
      if (ratingData) {
        app.average_rating = ratingData.sum / ratingData.count
        app.rating_count = ratingData.count
      }
    })
  }


  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: app.name,
    description: app.short_description || app.description,
    applicationCategory: 'WebApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: app.average_rating && app.rating_count ? {
      '@type': 'AggregateRating',
      ratingValue: app.average_rating,
      ratingCount: app.rating_count,
    } : undefined,
  }

  return (
    <>
      <Script
        id="app-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="container-custom py-12">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* App Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="flex items-start gap-6">
              {app.icon_url ? (
                <Image
                  src={app.icon_url}
                  alt={app.name}
                  width={128}
                  height={128}
                  className="rounded-lg object-cover"
                />
              ) : (
                <div className="w-32 h-32 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-4xl font-bold text-primary-600">
                    {app.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{app.name}</h1>
                {app.developer && (
                  <p className="text-gray-600 mb-4">by {app.developer}</p>
                )}
                
                <div className="flex items-center gap-6 mb-6">
                  {app.average_rating && app.rating_count > 0 && (
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{app.average_rating.toFixed(1)}</span>
                      <span className="text-gray-500">({app.rating_count})</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Download className="w-5 h-5" />
                    <span>{app.download_count} downloads</span>
                  </div>
                </div>

                <a
                  href={app.app_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                  Launch App
                </a>
              </div>
            </div>
          </div>

          {/* Screenshots */}
          {app.screenshot_urls && app.screenshot_urls.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-bold mb-6">Screenshots</h2>
              <div className="grid grid-cols-2 gap-4">
                {app.screenshot_urls.map((url, index) => (
                  <Image
                    key={index}
                    src={url}
                    alt={`${app.name} screenshot ${index + 1}`}
                    width={600}
                    height={400}
                    className="rounded-lg object-cover w-full"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-bold mb-4">About</h2>
            <p className="text-gray-700 whitespace-pre-line">{app.description}</p>
          </div>

          {/* Ratings & Reviews */}
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-bold mb-6">Ratings & Reviews</h2>
            <RatingForm
              appId={app.id}
              averageRating={app.average_rating}
              ratingCount={app.rating_count}
              userRating={app.user_rating}
              userReview={app.user_review}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">App Information</h3>
            <dl className="space-y-3">
              {app.version && (
                <>
                  <dt className="text-sm text-gray-500">Version</dt>
                  <dd className="text-sm font-medium">{app.version}</dd>
                </>
              )}
              {app.category && (
                <>
                  <dt className="text-sm text-gray-500">Category</dt>
                  <dd className="text-sm font-medium">{app.category.name}</dd>
                </>
              )}
              <dt className="text-sm text-gray-500">Status</dt>
              <dd className="text-sm font-medium capitalize">{app.status}</dd>
              <dt className="text-sm text-gray-500">Published</dt>
              <dd className="text-sm font-medium">
                {new Date(app.created_at).toLocaleDateString()}
              </dd>
            </dl>
          </div>
        </div>
      </div>

      {/* Related Apps */}
      {relatedApps && relatedApps.length > 0 && (
        <section className="mt-16">
          <h2 className="text-3xl font-bold mb-8">Related Apps</h2>
          <AppGrid apps={relatedApps} />
        </section>
      )}
      </div>
    </>
  )
}

