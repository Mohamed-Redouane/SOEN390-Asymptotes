import { describe, it, expect } from 'vitest'
import { timeToMinutes, formatMinutes, formatTime } from '../../utils/time-utils'

describe('timeToMinutes', () => {
  it('converts HH:MM format to total minutes', () => {
    expect(timeToMinutes("01:30")).toBe(90)
    expect(timeToMinutes("00:45")).toBe(45)
    expect(timeToMinutes("10:00")).toBe(600)
  })

  it('removes any "*" characters from the input', () => {
    expect(timeToMinutes("*02:15")).toBe(135)
  })
})

describe('formatMinutes', () => {
  it('returns "Departed" for non-positive values', () => {
    expect(formatMinutes(0)).toBe("Departed")
    expect(formatMinutes(-5)).toBe("Departed")
  })

  it('formats minutes less than 60 with " min"', () => {
    expect(formatMinutes(30)).toBe("30 min")
    expect(formatMinutes(59)).toBe("59 min")
  })

  it('formats minutes 60 or above in "h m" format', () => {
    expect(formatMinutes(60)).toBe("1h ")
    expect(formatMinutes(61)).toBe("1h 1m")
    expect(formatMinutes(135)).toBe("2h 15m")
    expect(formatMinutes(120)).toBe("2h ")
  })
})

describe('formatTime', () => {
  it('returns an empty string when provided null', () => {
    expect(formatTime(null)).toBe("")
  })

  it('formats a valid Date object to HH:MM', () => {
    const date = new Date(2025, 2, 27, 9, 5) // March 27, 2025, 09:05
    const formatted = formatTime(date)
    // Since toLocaleTimeString output can vary by environment, we'll check it matches a HH:MM pattern.
    expect(formatted).toMatch(/\d{2}:\d{2}/)
  })
})
