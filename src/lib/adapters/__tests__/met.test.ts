// @vitest-environment node
import type { Artwork } from '../../types'
import { normalizeMet } from '../met'

const fullMetObject = {
  objectID: 12345,
  title: 'Water Lilies',
  artistDisplayName: 'Claude Monet',
  objectDate: '1906',
  primaryImage: 'https://images.metmuseum.org/CRDImages/ep/original/DT1234.jpg',
  primaryImageSmall: 'https://images.metmuseum.org/CRDImages/ep/web-large/DT1234.jpg',
  department: 'European Paintings',
  isPublicDomain: true,
}

describe('normalizeMet', () => {
  it('returns an Artwork with all required fields given a full raw Met object', () => {
    const result = normalizeMet(fullMetObject)
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

  it('sets id to "met:12345" when objectID is 12345', () => {
    const result = normalizeMet(fullMetObject)
    expect(result?.id).toBe('met:12345')
  })

  it('sets source to "met"', () => {
    const result = normalizeMet(fullMetObject)
    expect(result?.source).toBe('met')
  })

  it('sets museum to "The Metropolitan Museum of Art"', () => {
    const result = normalizeMet(fullMetObject)
    expect(result?.museum).toBe('The Metropolitan Museum of Art')
  })

  it('sets artist to "Unknown Artist" when artistDisplayName is empty string', () => {
    const raw = { ...fullMetObject, artistDisplayName: '' }
    const result = normalizeMet(raw)
    expect(result?.artist).toBe('Unknown Artist')
  })

  it('sets artist to artistDisplayName when it is present', () => {
    const result = normalizeMet(fullMetObject)
    expect(result?.artist).toBe('Claude Monet')
  })

  it('returns null when primaryImageSmall is empty', () => {
    const raw = { ...fullMetObject, primaryImageSmall: '' }
    const result = normalizeMet(raw)
    expect(result).toBeNull()
  })

  it('sets imageUrl to primaryImageSmall from the raw object', () => {
    const result = normalizeMet(fullMetObject)
    expect(result?.imageUrl).toBe(fullMetObject.primaryImageSmall)
  })

  it('sets imageWidth to 800 as default (Met API does not return dimensions)', () => {
    const result = normalizeMet(fullMetObject)
    expect(result?.imageWidth).toBe(800)
  })

  it('sets imageHeight to 600 as default (Met API does not return dimensions)', () => {
    const result = normalizeMet(fullMetObject)
    expect(result?.imageHeight).toBe(600)
  })

  it('sets year from objectDate field', () => {
    const result = normalizeMet(fullMetObject)
    expect(result?.year).toBe('1906')
  })

  it('sets title from title field of the raw object', () => {
    const result = normalizeMet(fullMetObject)
    expect(result?.title).toBe('Water Lilies')
  })
})
