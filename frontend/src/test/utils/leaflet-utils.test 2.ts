import { describe, it, expect, vi } from 'vitest'
import L from 'leaflet'
import { initializeLeaflet, createCustomIcon } from '../../utils/leaflet-utils'

describe('initializeLeaflet', () => {
  it('merges default icon options', () => {
    const mergeOptionsSpy = vi.spyOn(L.Icon.Default, 'mergeOptions')
    initializeLeaflet()
    expect(mergeOptionsSpy).toHaveBeenCalledWith({
      iconRetinaUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    })
    mergeOptionsSpy.mockRestore()
  })
})

describe('createCustomIcon', () => {
  it('creates a custom bus icon', () => {
    const divIconSpy = vi.spyOn(L, 'divIcon')
    createCustomIcon('bus')
    expect(divIconSpy).toHaveBeenCalled()
    const args = divIconSpy.mock.calls[0][0]!
    expect(args.className).toBe('custom-leaflet-icon')
    expect(args.iconSize).toEqual([40, 40])
    expect(args.iconAnchor).toEqual([20, 20])
    expect(args.html).toContain('busPulse')
    divIconSpy.mockRestore()
  })

  it('creates a custom campus icon for loyola', () => {
    const divIconSpy = vi.spyOn(L, 'divIcon')
    createCustomIcon('campus', 'loyola')
    expect(divIconSpy).toHaveBeenCalled()
    const args = divIconSpy.mock.calls[0][0]!
    expect(args.html).toContain('pulse-loyola')
    expect(args.html).toContain('background-color: #26a69a')
    divIconSpy.mockRestore()
  })

  it('creates a custom campus icon for sgw', () => {
    const divIconSpy = vi.spyOn(L, 'divIcon')
    createCustomIcon('campus', 'sgw')
    expect(divIconSpy).toHaveBeenCalled()
    const args = divIconSpy.mock.calls[0][0]!
    expect(args.html).toContain('pulse-sgw')
    expect(args.html).toContain('background-color: #fb8c00')
    divIconSpy.mockRestore()
  })
})
