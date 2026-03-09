import type { Artwork } from '../types'

export type AicArtwork = {
  id: number
  title: string
  artist_display: string | null
  date_display: string
  image_id: string | null
}

export function normalizeAic(raw: AicArtwork): Artwork | null {
  if (!raw.image_id) return null
  return {
    id: `aic:${raw.id}`,
    source: 'aic',
    title: raw.title.slice(0, 200),
    artist: raw.artist_display || 'Unknown Artist',
    year: raw.date_display || '',
    imageUrl: `https://www.artic.edu/iiif/2/${raw.image_id}/full/843,/0/default.jpg`,
    imageWidth: 843,
    imageHeight: 1000,
    museum: 'Art Institute of Chicago',
  }
}

export async function fetchAicArtworks(): Promise<Artwork[]> {
  const url = `https://api.artic.edu/api/v1/artworks?fields=id,title,artist_display,date_display,image_id,is_public_domain,classification_title&limit=100&page=1&query[term][is_public_domain]=true`

  const res = await fetch(url)
  if (!res.ok) return []
  const data = await res.json()

  return (data.data || [])
    .map(normalizeAic)
    .filter((a: Artwork | null): a is Artwork => a !== null)
}
