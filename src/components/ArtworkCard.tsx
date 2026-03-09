'use client'

import { useState, useRef, useEffect } from 'react'
import type { Artwork } from '../lib/types'

type ArtworkCardProps = {
  artwork: Artwork
  isLiked: boolean
  onToggleLike: (id: string) => void
  index?: number
}

export function ArtworkCard({ artwork, isLiked, onToggleLike, index = 0 }: ArtworkCardProps) {
  const [loaded, setLoaded] = useState(false)
  const [visible, setVisible] = useState(false)
  const [likeAnim, setLikeAnim] = useState(false)
  const cardRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const card = cardRef.current
    if (!card) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.08 }
    )
    observer.observe(card)
    return () => observer.disconnect()
  }, [])

  function handleLike() {
    onToggleLike(artwork.id)
    if (!isLiked) {
      setLikeAnim(true)
      setTimeout(() => setLikeAnim(false), 700)
    }
  }

  return (
    <article
      ref={cardRef}
      style={{
        width: '100%',
        maxWidth: 680,
        margin: '0 auto',
        paddingBottom: 72,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.6s ease ${Math.min(index * 0.05, 0.3)}s, transform 0.6s ease ${Math.min(index * 0.05, 0.3)}s`,
      }}
    >
      {/* Image container */}
      <div style={{
        position: 'relative',
        width: '100%',
        background: '#131110',
        borderRadius: 2,
        overflow: 'hidden',
        cursor: 'default',
      }}>
        {/* Loading shimmer */}
        {!loaded && (
          <div style={{
            position: 'absolute',
            inset: 0,
            minHeight: 400,
            background: 'linear-gradient(90deg, #141210 25%, #1c1916 50%, #141210 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.8s ease-in-out infinite',
          }} />
        )}

        <img
          src={artwork.imageUrl}
          alt={`${artwork.title} by ${artwork.artist}`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          style={{
            display: 'block',
            width: '100%',
            height: 'auto',
            maxHeight: '80vh',
            objectFit: 'contain',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.5s ease',
          }}
        />

        {/* Subtle bottom vignette for text legibility */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          background: 'linear-gradient(to top, rgba(13,11,10,0.4) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Artwork info bar */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 16,
        paddingTop: 18,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Artist & Title */}
          <p style={{
            fontFamily: 'var(--font-display), "Cormorant Garamond", serif',
            fontSize: 19,
            fontWeight: 400,
            lineHeight: 1.3,
            color: 'var(--text-primary)',
            marginBottom: 4,
            letterSpacing: '0.01em',
          }}>
            <span style={{ fontStyle: 'italic' }}>{artwork.artist}</span>
            <span style={{ color: 'var(--text-tertiary)', fontWeight: 300 }}>{' — '}</span>
            <span style={{ fontWeight: 300 }}>{artwork.title}</span>
            {artwork.year && (
              <span style={{ color: 'var(--text-secondary)', fontWeight: 300 }}>
                {', '}{artwork.year}
              </span>
            )}
          </p>

          {/* Museum label */}
          <p style={{
            fontFamily: 'var(--font-body), "DM Sans", sans-serif',
            fontSize: 11,
            fontWeight: 300,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--gold-dim)',
          }}>
            {artwork.museum}
          </p>
        </div>

        {/* Like button */}
        <button
          onClick={handleLike}
          aria-label={isLiked ? 'Unlike artwork' : 'Like artwork'}
          style={{
            flexShrink: 0,
            background: 'none',
            border: 'none',
            padding: '4px 0 0 8px',
            cursor: 'pointer',
            color: isLiked ? 'var(--gold)' : 'var(--text-tertiary)',
            transition: 'color 0.25s ease',
            lineHeight: 0,
          }}
          onMouseEnter={(e) => {
            if (!isLiked) (e.currentTarget as HTMLButtonElement).style.color = 'var(--gold-dim)'
          }}
          onMouseLeave={(e) => {
            if (!isLiked) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-tertiary)'
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill={isLiked ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{
              animation: likeAnim ? 'heartbeat 0.65s ease' : 'none',
              display: 'block',
            }}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
    </article>
  )
}
