// @vitest-environment node
import type { Artwork } from '../../types'
import { normalizeAic } from '../aic'

const fullAicArtwork = {
  id: 67890,
  title: 'A Sunday on La Grande Jatte',
  artist_display: 'Georges Seurat',
  date_display: '1886',
  image_id: 'abc123-def456',
  is_public_domain: true,
  classification_title: 'Painting',
}

describe('normalizeAic', () => {
  it('returns an Artwork with all required fields given a raw AIC artwork response', () => {
    const result = normalizeAic(fullAicArtwork)
    expect(result).not.toBeNull()
    const artwork = result as Artwork
    expect(artwork.id).toBeDefined()
    expect(artwork.source).toBeDefined()
    expect(artwork.title).toBeDefined()
    expect(artwork.artist).toBeDefined()
    expect(artwork.year).toBeDefined()
    expect(artwork.imageUrl).toBeDefined()
    expect(typeof artwork.imageWidth).toBe('number')
    expect(typeof artwork.imageHeight).toBe('number')
    expect(artwork.museum).toBeDefined()
  })

  it('sets id to "aic:67890" when id is 67890', () => {
    const result = normalizeAic(fullAicArtwork)
    expect(result?.id).toBe('aic:67890')
  })

  it('sets source to "aic"', () => {
    const result = normalizeAic(fullAicArtwork)
    expect(result?.source).toBe('aic')
  })

  it('sets museum to "Art Institute of Chicago"', () => {
    const result = normalizeAic(fullAicArtwork)
    expect(result?.museum).toBe('Art Institute of Chicago')
  })

  it('builds imageUrl as a IIIF URL using image_id', () => {
    const result = normalizeAic(fullAicArtwork)
    expect(result?.imageUrl).toBe(
      'https://www.artic.edu/iiif/2/abc123-def456/full/843,/0/default.jpg'
    )
  })

  it('sets artist to artist_display when present', () => {
    const result = normalizeAic(fullAicArtwork)
    expect(result?.artist).toBe('Georges Seurat')
  })

  it('sets artist to "Unknown Artist" when artist_display is empty', () => {
    const raw = { ...fullAicArtwork, artist_display: '' }
    const result = normalizeAic(raw)
    expect(result?.artist).toBe('Unknown Artist')
  })

  it('sets artist to "Unknown Artist" when artist_display is null', () => {
    const raw = { ...fullAicArtwork, artist_display: null }
    const result = normalizeAic(raw as any)
    expect(result?.artist).toBe('Unknown Artist')
  })

  it('truncates title to 200 characters max', () => {
    const longTitle = 'A'.repeat(250)
    const raw = { ...fullAicArtwork, title: longTitle }
    const result = normalizeAic(raw)
    expect(result?.title.length).toBeLessThanOrEqual(200)
  })

  it('returns null when image_id is null', () => {
    const raw = { ...fullAicArtwork, image_id: null }
    const result = normalizeAic(raw as any)
    expect(result).toBeNull()
  })

  it('returns null when image_id is empty string', () => {
    const raw = { ...fullAicArtwork, image_id: '' }
    const result = normalizeAic(raw)
    expect(result).toBeNull()
  })

  it('sets imageWidth to 843 as default IIIF width', () => {
    const result = normalizeAic(fullAicArtwork)
    expect(result?.imageWidth).toBe(843)
  })

  it('sets imageHeight to 1000 as default IIIF height', () => {
    const result = normalizeAic(fullAicArtwork)
    expect(result?.imageHeight).toBe(1000)
  })

  it('sets year from date_display field', () => {
    const result = normalizeAic(fullAicArtwork)
    expect(result?.year).toBe('1886')
  })
})
