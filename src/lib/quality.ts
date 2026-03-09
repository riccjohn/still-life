import type { Artwork } from './types'

export function passesQualityFilter(artwork: Artwork): boolean {
  if (!artwork.imageUrl) return false
  if (!artwork.imageUrl.startsWith('http')) return false
  if (artwork.imageWidth < 400) return false
  return true
}
