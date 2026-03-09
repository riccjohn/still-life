import type { Artwork } from '../types'

export type MetObject = {
  objectID: number
  title: string
  artistDisplayName: string
  objectDate: string
  primaryImageSmall: string
}

export function normalizeMet(raw: MetObject): Artwork | null {
  if (!raw.primaryImageSmall) return null
  return {
    id: `met:${raw.objectID}`,
    source: 'met',
    title: raw.title,
    artist: raw.artistDisplayName || 'Unknown Artist',
    year: raw.objectDate || '',
    imageUrl: raw.primaryImageSmall,
    imageWidth: 800,
    imageHeight: 600,
    museum: 'The Metropolitan Museum of Art',
  }
}

export async function fetchMetArtworks(): Promise<Artwork[]> {
  const departments = [1, 11, 15, 21]
  const allIds: number[] = []

  for (const deptId of departments) {
    const url = `https://collectionapi.metmuseum.org/public/collection/v1/search?isPublicDomain=true&departmentId=${deptId}&q=painting&hasImages=true`
    try {
      const res = await fetch(url)
      if (!res.ok) continue
      const data = await res.json()
      if (data.objectIDs) {
        allIds.push(...data.objectIDs.slice(0, 25))
      }
    } catch {
      continue
    }
  }

  const results = await Promise.allSettled(
    allIds.slice(0, 80).map(async (id) => {
      const res = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`)
      if (!res.ok) return null
      const data = await res.json()
      return normalizeMet(data)
    })
  )

  return results
    .filter((r): r is PromiseFulfilledResult<Artwork> => r.status === 'fulfilled' && r.value !== null)
    .map(r => r.value)
}
