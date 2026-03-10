// @vitest-environment node
import type { Artwork } from '../types'
import { passesQualityFilter } from '../quality'

// Use a valid museum hostname so tests exercise the allowlist correctly.
const VALID_IMAGE_URL = 'https://images.metmuseum.org/CRDImages/ep/original/DT1234.jpg'

function makeArtwork(overrides: Partial<Artwork> = {}): Artwork {
  return {
    id: 'met:1',
    source: 'met',
    title: 'Test Artwork',
    artist: 'Test Artist',
    year: '2000',
    imageUrl: VALID_IMAGE_URL,
    imageWidth: 800,
    imageHeight: 600,
    museum: 'Test Museum',
    ...overrides,
  }
}

describe('passesQualityFilter', () => {
  it('returns false when imageUrl is empty string', () => {
    const artwork = makeArtwork({ imageUrl: '' })
    expect(passesQualityFilter(artwork)).toBe(false)
  })

  it('returns false when imageUrl is null', () => {
    const artwork = makeArtwork({ imageUrl: null as unknown as string })
    expect(passesQualityFilter(artwork)).toBe(false)
  })

  it('returns false when imageUrl has a disallowed hostname (ftp scheme)', () => {
    const artwork = makeArtwork({ imageUrl: 'ftp://images.metmuseum.org/image.jpg' })
    expect(passesQualityFilter(artwork)).toBe(false)
  })

  it('returns false when imageUrl hostname is not in the allowlist', () => {
    const artwork = makeArtwork({ imageUrl: 'https://example.com/image.jpg' })
    expect(passesQualityFilter(artwork)).toBe(false)
  })

  it('returns false when imageWidth is 399 (below 400)', () => {
    const artwork = makeArtwork({ imageWidth: 399 })
    expect(passesQualityFilter(artwork)).toBe(false)
  })

  it('returns false when imageWidth is 0', () => {
    const artwork = makeArtwork({ imageWidth: 0 })
    expect(passesQualityFilter(artwork)).toBe(false)
  })

  it('returns true for images.metmuseum.org with imageWidth 400', () => {
    const artwork = makeArtwork({
      imageUrl: 'https://images.metmuseum.org/CRDImages/ep/original/DT1234.jpg',
      imageWidth: 400,
    })
    expect(passesQualityFilter(artwork)).toBe(true)
  })

  it('returns true for www.artic.edu with imageWidth 843', () => {
    const artwork = makeArtwork({
      imageUrl: 'https://www.artic.edu/iiif/2/abc123/full/843,/0/default.jpg',
      imageWidth: 843,
    })
    expect(passesQualityFilter(artwork)).toBe(true)
  })

  it('returns true for openaccess-cdn.clevelandart.org with imageWidth 800', () => {
    const artwork = makeArtwork({
      imageUrl: 'https://openaccess-cdn.clevelandart.org/1234/1234_web.jpg',
      imageWidth: 800,
    })
    expect(passesQualityFilter(artwork)).toBe(true)
  })
})
