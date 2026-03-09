'use client'

import { useState, useEffect } from 'react'

export function useLikes() {
  const [liked, setLiked] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set()
    try {
      const stored = localStorage.getItem('likes')
      return stored ? new Set(JSON.parse(stored)) : new Set()
    } catch {
      return new Set()
    }
  })

  useEffect(() => {
    localStorage.setItem('likes', JSON.stringify([...liked]))
  }, [liked])

  const isLiked = (id: string) => liked.has(id)

  const toggleLike = (id: string) => {
    setLiked(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return { isLiked, toggleLike }
}
