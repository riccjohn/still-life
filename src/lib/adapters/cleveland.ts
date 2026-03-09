import type { Artwork } from '../types'

export type ClevelandArtwork = {
  id: number
  title: string
  creation_date: string
  creators: Array<{ description: string }> | null
  images: {
    web: {
      url: string
      width: number
      height: number
    } | null
  } | null
}

export function normalizeCleveland(raw: ClevelandArtwork): Artwork | null {
  if (!raw.images || !raw.images.web) return null
  return {
    id: `cleveland:${raw.id}`,
    source: 'cleveland',
    title: raw.title,
    artist: (raw.creators && raw.creators.length > 0) ? raw.creators[0].description : 'Unknown Artist',
    year: raw.creation_date || '',
    imageUrl: raw.images.web.url,
    imageWidth: raw.images.web.width,
    imageHeight: raw.images.web.height,
    museum: 'Cleveland Museum of Art',
  }
}

export async function fetchClevelandArtworks(): Promise<Artwork[]> {
  const url = `https://openaccess-api.clevelandart.org/api/artworks/?cc0=1&has_image=1&type=Painting&limit=100&skip=0`

  const res = await fetch(url)
  if (!res.ok) return []
  const data = await res.json()

  return (data.data || [])
    .map(normalizeCleveland)
    .filter((a: Artwork | null): a is Artwork => a !== null)
}
