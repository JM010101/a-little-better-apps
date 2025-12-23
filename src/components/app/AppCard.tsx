import Link from 'next/link'
import Image from 'next/image'
import { Star, Download } from 'lucide-react'
import { App } from '@/types/app'
import { cn } from '@/lib/utils'

interface AppCardProps {
  app: App
  className?: string
}

export function AppCard({ app, className }: AppCardProps) {
  const averageRating = app.average_rating || 0
  const ratingCount = app.rating_count || 0

  return (
    <Link
      href={`/app/${app.slug}`}
      className={cn(
        'group block bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-200 overflow-hidden',
        className
      )}
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          {app.icon_url ? (
            <div className="flex-shrink-0">
              <Image
                src={app.icon_url}
                alt={app.name}
                width={64}
                height={64}
                className="rounded-lg object-cover"
              />
            </div>
          ) : (
            <div className="flex-shrink-0 w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-600">
                {app.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-1">
              {app.name}
            </h3>
            
            {app.short_description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {app.short_description}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {ratingCount > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{averageRating.toFixed(1)}</span>
                  <span className="text-gray-400">({ratingCount})</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Download className="w-4 h-4" />
                <span>{app.download_count}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

