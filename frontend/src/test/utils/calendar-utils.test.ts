import { describe, it, expect } from 'vitest'
import { getNextClass } from '../../utils/calendar-utils'

describe('getNextClass', () => {
  it('should return the only class in the day', () => {
    const later = new Date();
    later.setHours(later.getHours() + 1);
    const classArr = [
      {start: { dateTime: String(later) }, location: "Building A", summary: ""},
    ];
    expect(getNextClass(classArr)).toBe(classArr[0]);
  })
  it('should return an empty array of classes', () => {
    const classArr: Array<{ start: { dateTime: string }, location: string, summary: string}> = []
    expect(getNextClass(classArr)).toStrictEqual(null);
  })
  it('should return the next class', () => {
    const today = new Date();
    
    // The earliest class is dates[1].
    const dates = [
      new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours()+1, today.getSeconds()),
      new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours()+2, today.getSeconds()),
      new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours()+3, today.getSeconds()),
    ]
    const classArr = dates.map((date, index) => {
      return {start: {dateTime: String(date)}, location: "Location " + index, summary: ""}
    })
    expect(getNextClass(classArr)).toBe(classArr[0]);
  })
})