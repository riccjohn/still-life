// @vitest-environment node
import type { Artwork } from '../types'
import { passesQualityFilter } from '../quality'

function makeArtwork(overrides: Partial<Artwork> = {}): Artwork {
  return {
    id: 'met:1',
    source: 'met',
    title: 'Test Artwork',
    artist: 'Test Artist',
    year: '2000',
    imageUrl: 'https://example.com/image.jpg',
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

  it('returns false when imageUrl starts with "ftp://"', () => {
    const artwork = makeArtwork({ imageUrl: 'ftp://example.com/image.jpg' })
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

  it('returns true when imageUrl starts with "https://" and imageWidth is 400', () => {
    const artwork = makeArtwork({
      imageUrl: 'https://example.com/image.jpg',
      imageWidth: 400,
    })
    expect(passesQualityFilter(artwork)).toBe(true)
  })

  it('returns true when imageUrl starts with "https://" and imageWidth is 843', () => {
    const artwork = makeArtwork({
      imageUrl: 'https://example.com/image.jpg',
      imageWidth: 843,
    })
    expect(passesQualityFilter(artwork)).toBe(true)
  })

  it('returns true when imageUrl starts with "http://" and imageWidth is 800', () => {
    const artwork = makeArtwork({
      imageUrl: 'http://example.com/image.jpg',
      imageWidth: 800,
    })
    expect(passesQualityFilter(artwork)).toBe(true)
  })
})
