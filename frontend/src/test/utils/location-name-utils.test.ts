import { describe, it, expect } from 'vitest'
import { getRoomNumber } from '../../utils/location-name-utils'

describe('getRoom', () => {
  it('returns the room number within brackets', () => {
    expect(getRoomNumber("Room number [H937]")).toBe("H937")
  })
  it('handles a null input', () => {
    expect(getRoomNumber(null)).toBe("")
  })
  it('trims a room input', () => {
    expect(getRoomNumber(" \r\t\n    asdf [\r\t\n H901  \t\n\t\r] \n\t\r    ")).toBe("H901")
  })
})