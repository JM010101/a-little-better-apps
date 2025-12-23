'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { AppGrid } from '@/components/app/AppGrid'
import { AppFilters } from '@/components/app/AppFilters'
import { App } from '@/types/app'
import { AppCategory } from '@/types/app'

interface HomePageClientProps {
  initialApps: App[]
  initialFeaturedApps: App[]
  categories: AppCategory[]
  initialPagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function HomePageClient({
  initialApps,
  initialFeaturedApps,
  categories,
  initialPagination,
}: HomePageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleFilterChange = (filters: {
    search?: string
    category?: string
    featured?: boolean
  }) => {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.category) params.set('category', filters.category)
    if (filters.featured) params.set('featured', 'true')
    
    // Navigate to trigger server-side fetch
    router.push(`/?${params.toString()}`)
  }

  return (
    <>
      {initialFeaturedApps.length > 0 && (
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Featured Apps</h2>
          <AppGrid apps={initialFeaturedApps} />
        </section>
      )}

      <div className="grid lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
            <h3 className="text-lg font-semibold mb-4">Filters</h3>
            <AppFilters 
              categories={categories}
              onFilterChange={handleFilterChange}
            />
          </div>
        </aside>

        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">All Apps</h2>
            <span className="text-gray-600">
              {initialPagination.total} {initialPagination.total === 1 ? 'app' : 'apps'}
            </span>
          </div>
          
          <AppGrid apps={initialApps} />
          
          {initialPagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: initialPagination.totalPages }, (_, i) => i + 1).map((page) => {
                const params = new URLSearchParams(searchParams.toString())
                params.set('page', page.toString())
                return (
                  <a
                    key={page}
                    href={`/?${params.toString()}`}
                    className={`px-4 py-2 rounded-lg ${
                      page === initialPagination.page
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </a>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

