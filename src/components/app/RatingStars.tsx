'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface RatingStarsProps {
  averageRating?: number
  ratingCount?: number
  userRating?: number
  userReview?: string | null
  onRate?: (rating: number, review?: string) => Promise<void>
  readOnly?: boolean
}

export function RatingStars({
  averageRating = 0,
  ratingCount = 0,
  userRating,
  userReview,
  onRate,
  readOnly = false,
}: RatingStarsProps) {
  const [hoveredRating, setHoveredRating] = useState(0)
  const [selectedRating, setSelectedRating] = useState(userRating || 0)
  const [review, setReview] = useState(userReview || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRatingClick = async (rating: number) => {
    if (readOnly || !onRate) return
    
    setSelectedRating(rating)
    setIsSubmitting(true)
    try {
      await onRate(rating, review || undefined)
    } catch (error) {
      console.error('Failed to submit rating:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReviewSubmit = async () => {
    if (readOnly || !onRate || selectedRating === 0) return
    
    setIsSubmitting(true)
    try {
      await onRate(selectedRating, review || undefined)
    } catch (error) {
      console.error('Failed to submit rating:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayRating = hoveredRating || selectedRating || Math.round(averageRating)

  return (
    <div className="space-y-4">
      {/* Display Average Rating */}
      {ratingCount > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  'w-5 h-5',
                  star <= displayRating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                )}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-gray-700">
            {averageRating.toFixed(1)}
          </span>
          <span className="text-sm text-gray-500">({ratingCount} reviews)</span>
        </div>
      )}

      {/* Interactive Rating (if not read-only) */}
      {!readOnly && onRate && (
        <div className="space-y-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingClick(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                disabled={isSubmitting}
                className="transition-transform hover:scale-110 disabled:opacity-50"
              >
                <Star
                  className={cn(
                    'w-6 h-6 transition-colors',
                    star <= (hoveredRating || selectedRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300 hover:text-yellow-300'
                  )}
                />
              </button>
            ))}
            {selectedRating > 0 && (
              <span className="ml-2 text-sm text-gray-600">
                {selectedRating === userRating ? 'Your rating' : 'Click to rate'}
              </span>
            )}
          </div>

          {/* Review Text Area */}
          {selectedRating > 0 && (
            <div className="space-y-2">
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Write a review (optional)..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                rows={3}
              />
              <Button
                onClick={handleReviewSubmit}
                disabled={isSubmitting}
                size="sm"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Display User Review */}
      {readOnly && userReview && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">{userReview}</p>
        </div>
      )}
    </div>
  )
}

