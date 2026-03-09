export type Artwork = {
  id: string            // "{source}:{originalId}"
  source: 'met' | 'aic' | 'cleveland'
  title: string
  artist: string        // fallback "Unknown Artist"
  year: string          // fallback ""
  imageUrl: string      // direct CDN URL, no proxy
  imageWidth: number
  imageHeight: number
  museum: string        // display name
  departmentId?: string
}
