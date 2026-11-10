import { describe, it, expect } from 'vitest';
import { convertTimestampToDate, formatDate } from './utils.js';

// Subtask subtask-1-1: Firebase date utilities (src/utilities/utils.js)

const FORMAT_OPTIONS = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };

describe('subtask-1-1 | convertTimestampToDate', () => {
  it('TC-1-1-01: converts whole seconds with zero nanoseconds to a Date with matching getTime()', () => {
    const result = convertTimestampToDate({ seconds: 1704067200, nanoseconds: 0 });

    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBe(1704067200000);
  });

  it('TC-1-1-02: converts nanoseconds to milliseconds and adds them to the seconds value', () => {
    const result = convertTimestampToDate({ seconds: 1704067200, nanoseconds: 500000000 });

    expect(result.getTime()).toBe(1704067200500);
  });

  it('TC-1-1-03: converts the epoch timestamp {seconds: 0, nanoseconds: 0} to a valid Date equal to new Date(0)', () => {
    const result = convertTimestampToDate({ seconds: 0, nanoseconds: 0 });

    expect(Number.isNaN(result.getTime())).toBe(false);
    expect(result).toEqual(new Date(0));
  });

  it('TC-1-1-04: converts a negative seconds value (pre-1970) to a valid Date with a negative getTime()', () => {
    const result = convertTimestampToDate({ seconds: -86400, nanoseconds: 0 });

    expect(Number.isNaN(result.getTime())).toBe(false);
    expect(result.getTime()).toBe(-86400000);
    expect(result.toISOString()).toBe('1969-12-31T00:00:00.000Z');
  });

  it('TC-1-1-05: returns a JavaScript Date whose UTC ISO string matches the expected value', () => {
    const result = convertTimestampToDate({ seconds: 1704067200, nanoseconds: 0 });

    expect(result instanceof Date).toBe(true);
    expect(result.getTime()).not.toBeNaN();
    expect(result.toISOString()).toBe('2024-01-01T00:00:00.000Z');
  });

  it('TC-1-1-06: returns an Invalid Date when nanoseconds is missing (current behavior)', () => {
    const result = convertTimestampToDate({ seconds: 10 });

    expect(result).toBeInstanceOf(Date);
    expect(Number.isNaN(result.getTime())).toBe(true);
  });

  it('TC-1-1-07: throws a TypeError for null or undefined input', () => {
    expect(() => convertTimestampToDate(null)).toThrow(TypeError);
    expect(() => convertTimestampToDate(undefined)).toThrow(TypeError);
  });
});

describe('subtask-1-1 | formatDate', () => {
  it('TC-1-1-08: formats a valid Date in es-ES containing year, "enero" and day, equal to toLocaleDateString with the same options', () => {
    const date = new Date(2024, 0, 15, 10, 30);
    const result = formatDate(date);

    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain('2024');
    expect(result).toContain('enero');
    expect(result).toContain('15');
    expect(result).toBe(date.toLocaleDateString('es-ES', FORMAT_OPTIONS));
  });

  it('TC-1-1-09: formats a Date produced by convertTimestampToDate and contains the Spanish month of that timestamp', () => {
    const timestamp = { seconds: 1704067200, nanoseconds: 0 };
    const converted = convertTimestampToDate(timestamp);
    const result = formatDate(converted);

    expect(result).toBe(formatDate(new Date(1704067200000)));
    const expectedMonth = converted.toLocaleDateString('es-ES', { month: 'long' });
    expect(result).toContain(expectedMonth);
  });

  it('TC-1-1-10: uses Spanish month names (e.g., "diciembre") and not English names', () => {
    const result = formatDate(new Date(2024, 11, 25, 9, 0));

    expect(result).toContain('diciembre');
    expect(result).not.toContain('December');
  });

  it('TC-1-1-11: returns "Invalid Date" for an Invalid Date without throwing', () => {
    let result;
    expect(() => {
      result = formatDate(new Date(NaN));
    }).not.toThrow();
    expect(result).toBe('Invalid Date');
  });

  it('TC-1-1-12: throws a TypeError for null, undefined, a string, or a number', () => {
    expect(() => formatDate(null)).toThrow(TypeError);
    expect(() => formatDate(undefined)).toThrow(TypeError);
    expect(() => formatDate('2024-01-15')).toThrow(TypeError);
    expect(() => formatDate(1704067200000)).toThrow(TypeError);
  });

  it('TC-1-1-13: includes a 2-digit hour and minute matching the same Intl call', () => {
    const date = new Date(2024, 0, 15, 10, 30);
    const result = formatDate(date);
    const timeFragment = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    expect(result).toContain(timeFragment);
    expect(result).toMatch(/\d{2}:\d{2}/);
  });
});
