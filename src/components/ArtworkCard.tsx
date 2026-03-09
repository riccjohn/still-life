'use client'

import type { Artwork } from '../lib/types'

type ArtworkCardProps = {
  artwork: Artwork
  isLiked: boolean
  onToggleLike: (id: string) => void
}

export function ArtworkCard({ artwork, isLiked, onToggleLike }: ArtworkCardProps) {
  return (
    <article>
      <img src={artwork.imageUrl} alt={`${artwork.title} by ${artwork.artist}`} loading="lazy" />
      <p><span>{artwork.artist}</span>{' — '}<span>{artwork.title}</span>{artwork.year ? <>{', '}<span>{artwork.year}</span></> : null}</p>
      <p>{artwork.museum}</p>
      <button onClick={() => onToggleLike(artwork.id)} aria-label={isLiked ? 'Unlike artwork' : 'Like artwork'}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill={isLiked ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
    </article>
  )
}
