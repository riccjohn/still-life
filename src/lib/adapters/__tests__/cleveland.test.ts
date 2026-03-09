// @vitest-environment node
import type { Artwork } from '../../types'
import { normalizeCleveland } from '../cleveland'

const fullClevelandArtwork = {
  id: 111,
  title: 'Starry Night',
  creation_date: '1889',
  creators: [{ description: 'Vincent van Gogh', role: 'artist' }],
  images: {
    web: {
      url: 'https://openaccess-cdn.clevelandart.org/1906.23/1906.23_web.jpg',
      width: 900,
      height: 720,
    },
  },
  share_license_status: 'CC0',
}

describe('normalizeCleveland', () => {
  it('returns an Artwork with all required fields given a raw Cleveland artwork response', () => {
    const result = normalizeCleveland(fullClevelandArtwork)
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

  it('sets id to "cleveland:111" when id is 111', () => {
    const result = normalizeCleveland(fullClevelandArtwork)
    expect(result?.id).toBe('cleveland:111')
  })

  it('sets source to "cleveland"', () => {
    const result = normalizeCleveland(fullClevelandArtwork)
    expect(result?.source).toBe('cleveland')
  })

  it('sets museum to "Cleveland Museum of Art"', () => {
    const result = normalizeCleveland(fullClevelandArtwork)
    expect(result?.museum).toBe('Cleveland Museum of Art')
  })

  it('sets imageWidth from images.web.width', () => {
    const result = normalizeCleveland(fullClevelandArtwork)
    expect(result?.imageWidth).toBe(900)
  })

  it('sets imageHeight from images.web.height', () => {
    const result = normalizeCleveland(fullClevelandArtwork)
    expect(result?.imageHeight).toBe(720)
  })

  it('sets imageUrl from images.web.url', () => {
    const result = normalizeCleveland(fullClevelandArtwork)
    expect(result?.imageUrl).toBe(
      'https://openaccess-cdn.clevelandart.org/1906.23/1906.23_web.jpg'
    )
  })

  it('sets artist to the first creator description when creators array is present', () => {
    const result = normalizeCleveland(fullClevelandArtwork)
    expect(result?.artist).toBe('Vincent van Gogh')
  })

  it('sets artist to "Unknown Artist" when creators array is empty', () => {
    const raw = { ...fullClevelandArtwork, creators: [] }
    const result = normalizeCleveland(raw)
    expect(result?.artist).toBe('Unknown Artist')
  })

  it('sets artist to "Unknown Artist" when creators is null', () => {
    const raw = { ...fullClevelandArtwork, creators: null }
    const result = normalizeCleveland(raw as any)
    expect(result?.artist).toBe('Unknown Artist')
  })

  it('returns null when images is null', () => {
    const raw = { ...fullClevelandArtwork, images: null }
    const result = normalizeCleveland(raw as any)
    expect(result).toBeNull()
  })

  it('returns null when images.web is null', () => {
    const raw = { ...fullClevelandArtwork, images: { web: null } }
    const result = normalizeCleveland(raw as any)
    expect(result).toBeNull()
  })

  it('sets year from creation_date field', () => {
    const result = normalizeCleveland(fullClevelandArtwork)
    expect(result?.year).toBe('1889')
  })

  it('sets title from title field', () => {
    const result = normalizeCleveland(fullClevelandArtwork)
    expect(result?.title).toBe('Starry Night')
  })
})
