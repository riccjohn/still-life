import { renderHook, act } from '@testing-library/react'
import { useLikes } from '../../useLikes'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

beforeEach(() => {
  localStorageMock.clear()
  vi.stubGlobal('localStorage', localStorageMock)
})

describe('useLikes', () => {
  it('isLiked returns false initially for an item not in localStorage', () => {
    const { result } = renderHook(() => useLikes())
    expect(result.current.isLiked('artwork:1')).toBe(false)
  })

  it('isLiked returns true after toggleLike is called', () => {
    const { result } = renderHook(() => useLikes())
    act(() => {
      result.current.toggleLike('artwork:1')
    })
    expect(result.current.isLiked('artwork:1')).toBe(true)
  })

  it('isLiked returns false after toggling twice (like then unlike)', () => {
    const { result } = renderHook(() => useLikes())
    act(() => {
      result.current.toggleLike('artwork:1')
    })
    act(() => {
      result.current.toggleLike('artwork:1')
    })
    expect(result.current.isLiked('artwork:1')).toBe(false)
  })

  it('isLiked returns true for a liked item and false for an unliked item', () => {
    const { result } = renderHook(() => useLikes())
    act(() => {
      result.current.toggleLike('artwork:liked')
    })
    expect(result.current.isLiked('artwork:liked')).toBe(true)
    expect(result.current.isLiked('artwork:notliked')).toBe(false)
  })

  it('loads initial liked state from localStorage', () => {
    localStorageMock.setItem('likes', JSON.stringify(['artwork:preloaded']))
    const { result } = renderHook(() => useLikes())
    expect(result.current.isLiked('artwork:preloaded')).toBe(true)
  })
})
