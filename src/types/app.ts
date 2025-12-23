export interface App {
  id: string
  name: string
  slug: string
  description: string
  short_description: string | null
  icon_url: string | null
  screenshot_urls: string[] | null
  app_url: string
  category_id: string | null
  developer: string | null
  version: string | null
  status: 'published' | 'draft' | 'archived'
  featured: boolean
  download_count: number
  created_at: string
  updated_at: string
  category?: AppCategory
  average_rating?: number
  rating_count?: number
  user_rating?: number
}

export interface AppCategory {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  created_at: string
}

export interface AppRating {
  id: string
  app_id: string
  user_id: string
  rating: number
  review: string | null
  created_at: string
  updated_at: string
  user?: {
    id: string
    email: string
  }
}

export interface AppFilters {
  category?: string
  search?: string
  featured?: boolean
  page?: number
  limit?: number
}

export interface ApiResponse<T = any> {
  success?: boolean
  data?: T
  error?: string
  message?: string
}

