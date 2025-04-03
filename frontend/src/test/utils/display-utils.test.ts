import { describe, it, expect } from 'vitest'
import { getDisplayName } from '../../utils/display-utils'

describe('getDisplayName', () => {
  it('should return "Loyola Campus" when id is "GPLoyola"', () => {
    expect(getDisplayName("GPLoyola")).toBe("Loyola Campus")
  })

  it('should return "Sir George Williams Campus" when id is "GPSirGeorge"', () => {
    expect(getDisplayName("GPSirGeorge")).toBe("Sir George Williams Campus")
  })

  it('should return "Shuttle #<number>" when id starts with "BUS"', () => {
    expect(getDisplayName("BUS123")).toBe("Shuttle #123")
    expect(getDisplayName("BUS42")).toBe("Shuttle #42")
  })

  it('should return the id itself when no matching case exists', () => {
    expect(getDisplayName("SomeOtherID")).toBe("SomeOtherID")
  })

  it('should handle the edge case when id is "BUS" (resulting in an empty shuttle number)', () => {
    expect(getDisplayName("BUS")).toBe("Shuttle #")
  })
})
