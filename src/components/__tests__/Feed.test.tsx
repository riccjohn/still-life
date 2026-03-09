/// <reference types="@testing-library/jest-dom" />
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Feed } from '../Feed'

// Mock fetch
global.fetch = vi.fn()

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

const mockArtwork = {
  id: 'met:1',
  source: 'met' as const,
  title: 'Test Painting',
  artist: 'Test Artist',
  year: '1900',
  imageUrl: 'https://example.com/img.jpg',
  imageWidth: 800,
  imageHeight: 600,
  museum: 'Test Museum',
}

const mockFeedResponse = {
  artworks: [mockArtwork],
  hasMore: false,
  nextPage: null,
}

beforeEach(() => {
  vi.mocked(global.fetch).mockResolvedValue({
    ok: true,
    json: async () => mockFeedResponse,
  } as Response)
})

describe('Feed', () => {
  it('calls fetch with a URL containing /api/feed on mount', async () => {
    render(<Feed />, { wrapper })
    await waitFor(() => {
      expect(vi.mocked(global.fetch)).toHaveBeenCalled()
    })
    const fetchUrl = vi.mocked(global.fetch).mock.calls[0][0] as string
    expect(fetchUrl).toContain('/api/feed')
  })

  it('renders the artwork title after fetch resolves', async () => {
    render(<Feed />, { wrapper })
    await waitFor(() => {
      expect(screen.getByText('Test Painting')).toBeInTheDocument()
    })
  })

  it('shows a loading state while fetching', async () => {
    // Use a promise that we can control to keep fetch pending
    let resolveFetch!: (value: Response) => void
    vi.mocked(global.fetch).mockReturnValue(
      new Promise<Response>((resolve) => { resolveFetch = resolve })
    )

    render(<Feed />, { wrapper })

    // While fetch is still pending, a loading indicator should be visible
    const loadingEl =
      screen.queryByText(/loading/i) ??
      screen.queryByRole('progressbar') ??
      document.querySelector('[data-testid="loading"]') ??
      document.querySelector('[aria-busy="true"]')

    expect(loadingEl).not.toBeNull()

    // Clean up: resolve the fetch so no pending state leaks
    resolveFetch({
      ok: true,
      json: async () => mockFeedResponse,
    } as Response)
  })
})
