import Link from 'next/link'
import { Package } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container-custom py-24">
      <div className="text-center">
        <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">App Not Found</h1>
        <p className="text-xl text-gray-600 mb-8">
          The app you're looking for doesn't exist or has been removed.
        </p>
        <Link
          href="/"
          className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Browse All Apps
        </Link>
      </div>
    </div>
  )
}

