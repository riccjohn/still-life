import { NextResponse } from 'next/server'
import { fetchMetArtworks } from '../../../lib/adapters/met'
import { fetchAicArtworks } from '../../../lib/adapters/aic'
import { fetchClevelandArtworks } from '../../../lib/adapters/cleveland'
import { passesQualityFilter } from '../../../lib/quality'
import type { Artwork } from '../../../lib/types'

// In-memory rate limiter: 30 requests per minute per IP.
// Using a Map keyed by IP with a rolling window tracked via request timestamps.
interface RateLimitEntry {
  timestamps: number[]
}

const rateLimitMap = new Map<string, RateLimitEntry>()
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = 30

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip) ?? { timestamps: [] }

  // Discard timestamps outside the current window
  const windowStart = now - RATE_LIMIT_WINDOW_MS
  const recentTimestamps = entry.timestamps.filter((t) => t > windowStart)

  if (recentTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    return true
  }

  recentTimestamps.push(now)
  rateLimitMap.set(ip, { timestamps: recentTimestamps })
  return false
}

function extractClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    // x-forwarded-for may contain a comma-separated list; the first entry is the client IP
    const first = forwarded.split(',')[0].trim()
    if (first) return first
  }
  return 'unknown'
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export async function GET(request: Request) {
  const ip = extractClientIp(request)

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait before retrying.' },
      { status: 429 }
    )
  }

  const url = new URL(request.url)
  const pageParam = url.searchParams.get('page') ?? '1'
  const pageSizeParam = url.searchParams.get('pageSize') ?? '20'

  const page = parseInt(pageParam, 10)
  const pageSize = parseInt(pageSizeParam, 10)

  if (isNaN(page) || isNaN(pageSize)) {
    return NextResponse.json({ error: 'Invalid page parameter' }, { status: 400 })
  }

  if (pageSize < 1 || pageSize > 100) {
    return NextResponse.json(
      { error: 'pageSize must be between 1 and 100 inclusive' },
      { status: 400 }
    )
  }

  if (page < 1) {
    return NextResponse.json(
      { error: 'page must be greater than or equal to 1' },
      { status: 400 }
    )
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
