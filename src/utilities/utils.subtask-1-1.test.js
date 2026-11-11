import { describe, it, expect } from 'vitest';
import { convertTimestampToDate, formatDate } from './utils.js';

const ES_OPTIONS = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

describe('subtask-1-1: convertTimestampToDate', () => {
  it('TC-1-1-01: converts a valid Firestore-like timestamp to a Date with the expected time value', () => {
    const result = convertTimestampToDate({ seconds: 1700000000, nanoseconds: 0 });

    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBe(1700000000000);
  });

  it('TC-1-1-02: converts nanoseconds to milliseconds and adds them to the seconds value', () => {
    const result = convertTimestampToDate({ seconds: 1700000000, nanoseconds: 500000000 });

    expect(result.getTime()).toBe(1700000000500);
  });

  it('TC-1-1-03: converts a zero timestamp to the Unix epoch', () => {
    const result = convertTimestampToDate({ seconds: 0, nanoseconds: 0 });

    expect(result.getTime()).toBe(0);
  });

  it('TC-1-1-04: converts negative seconds (pre-1970) to a negative time value', () => {
    const result = convertTimestampToDate({ seconds: -86400, nanoseconds: 0 });

    expect(result.getTime()).toBe(-86400000);
  });

  it('TC-1-1-05: returns a valid Date instance for a valid timestamp', () => {
    const result = convertTimestampToDate({ seconds: 1700000000, nanoseconds: 0 });

    expect(result instanceof Date).toBe(true);
    expect(isNaN(result.getTime())).toBe(false);
  });

  it('TC-1-1-06: throws a TypeError when the timestamp is null or undefined', () => {
    expect(() => convertTimestampToDate(null)).toThrow(TypeError);
    expect(() => convertTimestampToDate(undefined)).toThrow(TypeError);
  });

  it('TC-1-1-07: returns an invalid Date (NaN time) when seconds or nanoseconds are missing', () => {
    // Current behavior documented as-is: missing fields yield NaN arithmetic.
    expect(isNaN(convertTimestampToDate({}).getTime())).toBe(true);
    expect(isNaN(convertTimestampToDate({ seconds: 10 }).getTime())).toBe(true);
  });

  it('TC-1-1-08: returns an invalid Date (NaN time) when fields are non-numeric', () => {
    const result = convertTimestampToDate({ seconds: 'abc', nanoseconds: 0 });

    expect(result).toBeInstanceOf(Date);
    expect(Number.isNaN(result.getTime())).toBe(true);
  });
});

describe('subtask-1-1: formatDate', () => {
  it('TC-1-1-09: formats a local date with year, day, Spanish long month and time', () => {
    const result = formatDate(new Date(2024, 0, 15, 10, 30));

    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain('2024');
    expect(result).toContain('15');
    expect(result.toLowerCase()).toContain('enero');
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });

  it('TC-1-1-10: returns exactly the runtime es-ES formatting for the same options', () => {
    const date = new Date(2024, 0, 15, 10, 30);

    expect(formatDate(date)).toBe(date.toLocaleDateString('es-ES', ES_OPTIONS));
  });

  it('TC-1-1-11: formats a November date with the Spanish month name', () => {
    const result = formatDate(new Date(2023, 10, 5, 8, 5));

    expect(result.toLowerCase()).toContain('noviembre');
    expect(result).toContain('2023');
  });

  it('TC-1-1-12: formatting a converted Firestore timestamp equals formatting the equivalent Date', () => {
    const seconds = 1700000000;
    const nanoseconds = 500000000;

    const result = formatDate(convertTimestampToDate({ seconds, nanoseconds }));
    const expected = formatDate(new Date(seconds * 1000 + nanoseconds / 1000000));

    expect(result).toBe(expected);
    expect(result.length).toBeGreaterThan(0);
    expect(result.toLowerCase()).toContain('noviembre');
  });

  it('TC-1-1-13: returns "Invalid Date" without throwing for an invalid Date object', () => {
    let result;
    expect(() => {
      result = formatDate(new Date('invalid'));
    }).not.toThrow();
    expect(result).toBe('Invalid Date');
  });

  it('TC-1-1-14: throws a TypeError for undefined, null, or a plain date string', () => {
    expect(() => formatDate(undefined)).toThrow(TypeError);
    expect(() => formatDate(null)).toThrow(TypeError);
    expect(() => formatDate('2024-01-15')).toThrow(TypeError);
  });
});
