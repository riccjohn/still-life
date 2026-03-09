'use client'

import { useEffect, useRef } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { ArtworkCard } from './ArtworkCard'
import { useLikes } from '../useLikes'
import type { Artwork } from '../lib/types'

type FeedPage = {
  artworks: Artwork[]
  nextPage: number | null
}

async function fetchFeedPage({ pageParam = 1 }: { pageParam: number }): Promise<FeedPage> {
  const res = await fetch(`/api/feed?page=${pageParam}`)
  if (!res.ok) throw new Error('Failed to fetch feed')
  return res.json()
}

export function Feed() {
  const { isLiked, toggleLike } = useLikes()
  const sentinelRef = useRef<HTMLDivElement>(null)

  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: fetchFeedPage,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
  })

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isLoading) {
    return <p>Loading...</p>
  }

  const artworks = data?.pages.flatMap((page: FeedPage) => page.artworks) ?? []

  return (
    <main>
      {artworks.map((artwork: Artwork) => (
        <ArtworkCard
          key={artwork.id}
          artwork={artwork}
          isLiked={isLiked(artwork.id)}
          onToggleLike={toggleLike}
        />
      ))}
      <div ref={sentinelRef} style={{ height: 1 }} />
      {isFetchingNextPage && <p>Loading more...</p>}
    </main>
  )
}
