import type { Artwork } from './types'

const ALLOWED_IMAGE_HOSTNAMES = new Set([
  'images.metmuseum.org',
  'www.artic.edu',
  'openaccess-cdn.clevelandart.org',
])

function isAllowedImageUrl(imageUrl: string): boolean {
  try {
    const parsed = new URL(imageUrl)
    // Only allow HTTPS — reject ftp://, http://, data:, etc.
    return parsed.protocol === 'https:' && ALLOWED_IMAGE_HOSTNAMES.has(parsed.hostname)
  } catch {
    return false
  }
}

export function passesQualityFilter(artwork: Artwork): boolean {
  if (!artwork.imageUrl) return false
  if (!isAllowedImageUrl(artwork.imageUrl)) return false
  if (artwork.imageWidth < 400) return false
  return true
}
