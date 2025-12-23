'use client'

import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { AppCategory } from '@/types/app'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface AppFiltersProps {
  categories: AppCategory[]
  onFilterChange: (filters: {
    search?: string
    category?: string
    featured?: boolean
  }) => void
  className?: string
}

export function AppFilters({ categories, onFilterChange, className }: AppFiltersProps) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [featured, setFeatured] = useState(false)

  useEffect(() => {
    // Debounce search to avoid too many requests
    const timeoutId = setTimeout(() => {
      onFilterChange({
        search: search || undefined,
        category: selectedCategory || undefined,
        featured: featured || undefined,
      })
    }, search ? 500 : 0) // Immediate for non-search filters, debounced for search

    return () => clearTimeout(timeoutId)
  }, [search, selectedCategory, featured, onFilterChange])

  const clearFilters = () => {
    setSearch('')
    setSelectedCategory('')
    setFeatured(false)
  }

  const hasActiveFilters = search || selectedCategory || featured

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search apps..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Featured Toggle */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="featured"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
        <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
          Featured apps only
        </label>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="w-full"
        >
          Clear Filters
        </Button>
      )}
    </div>
  )
}

