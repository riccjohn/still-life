import { NextResponse } from 'next/server'
import { fetchMetArtworks } from '../../../lib/adapters/met'
import { fetchAicArtworks } from '../../../lib/adapters/aic'
import { fetchClevelandArtworks } from '../../../lib/adapters/cleveland'
import { passesQualityFilter } from '../../../lib/quality'
import type { Artwork } from '../../../lib/types'

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const pageParam = url.searchParams.get('page') ?? '1'
  const pageSizeParam = url.searchParams.get('pageSize') ?? '20'

  const page = parseInt(pageParam, 10)
  const pageSize = parseInt(pageSizeParam, 10)

  if (isNaN(page) || isNaN(pageSize)) {
    return NextResponse.json({ error: 'Invalid page parameter' }, { status: 400 })
  }

  const [metArtworks, aicArtworks, clevelandArtworks] = await Promise.all([
    fetchMetArtworks(),
    fetchAicArtworks(),
    fetchClevelandArtworks(),
  ])

  const allArtworks: Artwork[] = [...metArtworks, ...aicArtworks, ...clevelandArtworks]
    .filter(passesQualityFilter)

  const shuffled = shuffleArray(allArtworks)

  const start = (page - 1) * pageSize
  const end = start + pageSize
  const artworks = shuffled.slice(start, end)
  const hasMore = end < shuffled.length

  return NextResponse.json({
    artworks,
    hasMore,
    nextPage: hasMore ? page + 1 : null,
  })
}
