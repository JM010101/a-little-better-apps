'use client'

import { useState } from 'react'
import { RatingStars } from './RatingStars'

interface RatingFormProps {
  appId: string
  averageRating?: number
  ratingCount?: number
  userRating?: number
  userReview?: string | null
}

export function RatingForm({ appId, averageRating, ratingCount, userRating, userReview }: RatingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRate = async (rating: number, review?: string) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/apps/${appId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, review }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit rating')
      }
      
      // Refresh the page to show updated rating
      window.location.reload()
    } catch (error) {
      console.error('Failed to submit rating:', error)
      alert(error instanceof Error ? error.message : 'Failed to submit rating')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <RatingStars
      averageRating={averageRating}
      ratingCount={ratingCount}
      userRating={userRating}
      userReview={userReview}
      onRate={handleRate}
      readOnly={isSubmitting}
    />
  )
}

