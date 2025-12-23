import { App } from '@/types/app'
import { AppCard } from './AppCard'
import { Package } from 'lucide-react'

interface AppGridProps {
  apps: App[]
  className?: string
}

export function AppGrid({ apps, className }: AppGridProps) {
  if (apps.length === 0) {
    return (
      <div className="text-center py-16">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No apps found</h3>
        <p className="text-gray-600">Try adjusting your filters or search terms.</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.map((app) => (
          <AppCard key={app.id} app={app} />
        ))}
      </div>
    </div>
  )
}

