/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent } from '@testing-library/react'
import { ArtworkCard } from '../ArtworkCard'
import type { Artwork } from '../../lib/types'

const mockArtwork: Artwork = {
  id: 'met:12345',
  source: 'met',
  title: 'Water Lilies',
  artist: 'Claude Monet',
  year: '1906',
  imageUrl: 'https://images.metmuseum.org/test.jpg',
  imageWidth: 800,
  imageHeight: 600,
  museum: 'The Metropolitan Museum of Art',
}

describe('ArtworkCard', () => {
  it('renders an img with the artwork imageUrl as src', () => {
    render(<ArtworkCard artwork={mockArtwork} isLiked={false} onToggleLike={() => {}} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', mockArtwork.imageUrl)
  })

  it('renders the artist name', () => {
    render(<ArtworkCard artwork={mockArtwork} isLiked={false} onToggleLike={() => {}} />)
    expect(screen.getByText('Claude Monet')).toBeInTheDocument()
  })

  it('renders the artwork title', () => {
    render(<ArtworkCard artwork={mockArtwork} isLiked={false} onToggleLike={() => {}} />)
    expect(screen.getByText('Water Lilies')).toBeInTheDocument()
  })

  it('renders the artwork year', () => {
    render(<ArtworkCard artwork={mockArtwork} isLiked={false} onToggleLike={() => {}} />)
    expect(screen.getByText('1906')).toBeInTheDocument()
  })

  it('renders the museum name', () => {
    render(<ArtworkCard artwork={mockArtwork} isLiked={false} onToggleLike={() => {}} />)
    expect(screen.getByText('The Metropolitan Museum of Art')).toBeInTheDocument()
  })

  it('when isLiked is false, heart button has aria-label containing "like"', () => {
    render(<ArtworkCard artwork={mockArtwork} isLiked={false} onToggleLike={() => {}} />)
    const button = screen.getByRole('button')
    expect(button.getAttribute('aria-label')?.toLowerCase()).toContain('like')
  })

  it('when isLiked is true, heart button has aria-label containing "unlike"', () => {
    render(<ArtworkCard artwork={mockArtwork} isLiked={true} onToggleLike={() => {}} />)
    const button = screen.getByRole('button')
    expect(button.getAttribute('aria-label')?.toLowerCase()).toContain('unlike')
  })

  it('clicking the heart button calls onToggleLike with the artwork id', () => {
    const onToggleLike = vi.fn()
    render(<ArtworkCard artwork={mockArtwork} isLiked={false} onToggleLike={onToggleLike} />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(onToggleLike).toHaveBeenCalledWith(mockArtwork.id)
  })
})
