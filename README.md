# Still Life

An infinite-scroll art discovery feed aggregating public domain works from three major museum collections.

## Features

- Infinite scroll feed of curated artworks
- Pulls from the Met, Art Institute of Chicago, and Cleveland Museum of Art
- Quality filtering to surface well-imaged, titled works
- Like/save artworks locally
- Dark gallery aesthetic

## Museums

| Museum | API |
|--------|-----|
| The Metropolitan Museum of Art | [collectionapi.metmuseum.org](https://collectionapi.metmuseum.org) |
| Art Institute of Chicago | [api.artic.edu](https://api.artic.edu) |
| Cleveland Museum of Art | [openaccess-api.clevelandart.org](https://openaccess-api.clevelandart.org) |

All collections are open access / public domain.

## API

`GET /api/feed?page=1&pageSize=20`

Returns a shuffled, quality-filtered page of artworks across all three sources.

## Development

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

- [Next.js](https://nextjs.org) (App Router)
- TypeScript
- Tailwind CSS
