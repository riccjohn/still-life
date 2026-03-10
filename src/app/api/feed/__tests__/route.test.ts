// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Artwork } from '../../../../lib/types'

vi.mock('../../../../lib/adapters/met', () => ({
  normalizeMet: vi.fn(),
  fetchMetArtworks: vi.fn(),
}))
vi.mock('../../../../lib/adapters/aic', () => ({
  normalizeAic: vi.fn(),
  fetchAicArtworks: vi.fn(),
}))
vi.mock('../../../../lib/adapters/cleveland', () => ({
  normalizeCleveland: vi.fn(),
  fetchClevelandArtworks: vi.fn(),
}))

import { fetchMetArtworks } from '../../../../lib/adapters/met'
import { fetchAicArtworks } from '../../../../lib/adapters/aic'
import { fetchClevelandArtworks } from '../../../../lib/adapters/cleveland'
import { GET } from '../route'

function makeArtwork(id: string, source: 'met' | 'aic' | 'cleveland' = 'met'): Artwork {
  // Use a valid museum hostname so artworks pass the quality filter allowlist.
  const imageUrlBySource: Record<typeof source, string> = {
    met: 'https://images.metmuseum.org/CRDImages/ep/original/DT1.jpg',
    aic: 'https://www.artic.edu/iiif/2/abc/full/843,/0/default.jpg',
    cleveland: 'https://openaccess-cdn.clevelandart.org/1/1_web.jpg',
  }
  return {
    id,
    source,
    title: 'Test Title',
    artist: 'Test Artist',
    year: '2000',
    imageUrl: imageUrlBySource[source],
    imageWidth: 800,
    imageHeight: 600,
    museum: 'Test Museum',
  }
}

describe('GET /api/feed', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(fetchMetArtworks).mockResolvedValue(
      Array.from({ length: 20 }, (_, i) => makeArtwork(`met:${i + 1}`, 'met'))
    )
    vi.mocked(fetchAicArtworks).mockResolvedValue(
      Array.from({ length: 20 }, (_, i) => makeArtwork(`aic:${i + 1}`, 'aic'))
    )
    vi.mocked(fetchClevelandArtworks).mockResolvedValue(
      Array.from({ length: 20 }, (_, i) => makeArtwork(`cleveland:${i + 1}`, 'cleveland'))
    )
  })

  it('returns HTTP 200', async () => {
    const response = await GET(new Request('http://localhost:3000/api/feed?page=1'))
    expect(response.status).toBe(200)
  })

  it('response body has artworks array and hasMore boolean', async () => {
    const response = await GET(new Request('http://localhost:3000/api/feed?page=1'))
    const body = await response.json()
    expect(Array.isArray(body.artworks)).toBe(true)
    expect(typeof body.hasMore).toBe('boolean')
  })

  it('default pageSize is 20', async () => {
    const response = await GET(new Request('http://localhost:3000/api/feed?page=1'))
    const body = await response.json()
    expect(body.artworks.length).toBe(20)
  })

  it('custom pageSize returns correct number of artworks', async () => {
    const response = await GET(new Request('http://localhost:3000/api/feed?page=1&pageSize=5'))
    const body = await response.json()
    expect(body.artworks.length).toBe(5)
  })

  it('hasMore is true when more pages exist', async () => {
    // 60 total, page=1, pageSize=20 => items 1-20 served, 40 remain
    const response = await GET(new Request('http://localhost:3000/api/feed?page=1&pageSize=20'))
    const body = await response.json()
    expect(body.hasMore).toBe(true)
  })

  it('hasMore is false on the last page', async () => {
    // 60 total, page=3, pageSize=20 => items 41-60 served, none remain
    const response = await GET(new Request('http://localhost:3000/api/feed?page=3&pageSize=20'))
    const body = await response.json()
    expect(body.hasMore).toBe(false)
  })

  it('returns 400 for invalid page param', async () => {
    const response = await GET(new Request('http://localhost:3000/api/feed?page=abc'))
    expect(response.status).toBe(400)
  })

  it('each artwork in response has required non-empty fields', async () => {
    const response = await GET(new Request('http://localhost:3000/api/feed?page=1'))
    const body = await response.json()
    for (const artwork of body.artworks as Artwork[]) {
      expect(artwork.id).toBeTruthy()
      expect(artwork.title).toBeTruthy()
      expect(artwork.artist).toBeTruthy()
      expect(artwork.imageUrl).toBeTruthy()
    }
  })
})
