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

function SkeletonCard() {
  return (
    <article style={{
      width: '100%',
      maxWidth: 680,
      margin: '0 auto',
      padding: '0 0 64px',
    }}>
      <div style={{
        width: '100%',
        aspectRatio: '4/5',
        background: 'linear-gradient(90deg, #1a1814 25%, #232018 50%, #1a1814 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.8s ease-in-out infinite',
        borderRadius: 2,
      }} />
      <div style={{ padding: '20px 0 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{
          height: 14,
          width: '55%',
          background: 'linear-gradient(90deg, #1a1814 25%, #232018 50%, #1a1814 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.8s ease-in-out infinite 0.1s',
          borderRadius: 2,
        }} />
        <div style={{
          height: 12,
          width: '30%',
          background: 'linear-gradient(90deg, #1a1814 25%, #232018 50%, #1a1814 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.8s ease-in-out infinite 0.2s',
          borderRadius: 2,
        }} />
      </div>
    </article>
  )
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
      { rootMargin: '400px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const artworks = data?.pages.flatMap((page: FeedPage) => page.artworks) ?? []

  return (
    <div style={{ minHeight: '100dvh' }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        background: 'linear-gradient(to bottom, rgba(13,11,10,0.95) 0%, rgba(13,11,10,0.6) 100%)',
        borderBottom: '1px solid rgba(200,169,110,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{
            fontFamily: 'var(--font-display), "Cormorant Garamond", serif',
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: '0.04em',
            color: 'var(--text-primary)',
          }}>
            Still Life
          </span>
          <span style={{
            fontFamily: 'var(--font-body), "DM Sans", sans-serif',
            fontSize: 11,
            fontWeight: 300,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--gold-dim)',
          }}>
            Art Feed
          </span>
        </div>
        <div style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'var(--gold)',
          opacity: isLoading ? 0 : 0.6,
          transition: 'opacity 0.4s',
        }} />
      </header>

      {/* Feed */}
      <main style={{
        padding: '48px 24px 80px',
        maxWidth: 760,
        margin: '0 auto',
      }}>
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          artworks.map((artwork: Artwork, i: number) => (
            <ArtworkCard
              key={artwork.id}
              artwork={artwork}
              isLiked={isLiked(artwork.id)}
              onToggleLike={toggleLike}
              index={i}
            />
          ))
        )}

        <div ref={sentinelRef} style={{ height: 1 }} />

        {isFetchingNextPage && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 6,
            padding: '32px 0 48px',
          }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: 'var(--gold)',
                animation: `pulse-dot 1.2s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }} />
            ))}
          </div>
        )}

        {!hasNextPage && artworks.length > 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px 0 48px',
          }}>
            <div style={{
              display: 'inline-block',
              width: 40,
              height: 1,
              background: 'var(--border)',
              verticalAlign: 'middle',
              marginRight: 16,
            }} />
            <span style={{
              fontFamily: 'var(--font-body), "DM Sans", sans-serif',
              fontSize: 11,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'var(--text-tertiary)',
            }}>
              End of gallery
            </span>
            <div style={{
              display: 'inline-block',
              width: 40,
              height: 1,
              background: 'var(--border)',
              verticalAlign: 'middle',
              marginLeft: 16,
            }} />
          </div>
        )}
      </main>
    </div>
  )
}
