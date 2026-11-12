import { describe, it, expect } from 'vitest';
import { convertTimestampToDate, formatDate } from './utils';

const SPANISH_OPTIONS = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

describe('subtask-1-1: convertTimestampToDate', () => {
  it('UT-DATE-01: converts seconds and nanoseconds to milliseconds since epoch', () => {
    const result = convertTimestampToDate({ seconds: 1700000000, nanoseconds: 500000000 });

    expect(result.getTime()).toBe(1700000000500);
  });

  it('UT-DATE-02: returns a valid Date instance for valid input', () => {
    const result = convertTimestampToDate({ seconds: 1700000000, nanoseconds: 0 });

    expect(result).toBeInstanceOf(Date);
    expect(isNaN(result.getTime())).toBe(false);
  });

  it('UT-DATE-03: converts the Unix epoch when seconds and nanoseconds are zero', () => {
    const result = convertTimestampToDate({ seconds: 0, nanoseconds: 0 });

    expect(result.toISOString()).toBe('1970-01-01T00:00:00.000Z');
  });

  it('UT-DATE-04: truncates sub-millisecond nanoseconds', () => {
    // 10 * 1000 + 999999 / 1e6 = 10000.999999 ms, which Date truncates to 10000 ms.
    const result = convertTimestampToDate({ seconds: 10, nanoseconds: 999999 });

    expect(result.getTime()).toBe(10000);
  });

  it('UT-DATE-05: converts a known UTC instant to the expected ISO string', () => {
    const seconds = Date.UTC(2024, 2, 15, 12, 0, 0) / 1000;
    const result = convertTimestampToDate({ seconds, nanoseconds: 0 });

    expect(result.toISOString()).toBe('2024-03-15T12:00:00.000Z');
  });

  it('UT-DATE-06: returns an Invalid Date when nanoseconds is missing', () => {
    const result = convertTimestampToDate({ seconds: 100 });

    expect(isNaN(result.getTime())).toBe(true);
  });

  it('UT-DATE-07: returns an Invalid Date when seconds is non-numeric', () => {
    const result = convertTimestampToDate({ seconds: 'abc', nanoseconds: 0 });

    expect(isNaN(result.getTime())).toBe(true);
  });

  it('UT-DATE-08: throws TypeError when timestamp is null or undefined', () => {
    expect(() => convertTimestampToDate(null)).toThrow(TypeError);
    expect(() => convertTimestampToDate(undefined)).toThrow(TypeError);
  });

  it('UT-DATE-09: returns an Invalid Date for an empty object', () => {
    const result = convertTimestampToDate({});

    expect(isNaN(result.getTime())).toBe(true);
  });
});

describe('subtask-1-1: formatDate', () => {
  it('UT-DATE-10: returns the es-ES formatted string for a valid Date', () => {
    const date = new Date(Date.UTC(2024, 2, 15, 12, 0, 0));
    const result = formatDate(date);

    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain('marzo');
    expect(result).toContain('2024');
    expect(result).toBe(date.toLocaleDateString('es-ES', SPANISH_OPTIONS));
  });

  it('UT-DATE-11: uses es-ES options including a time component', () => {
    const date = new Date(Date.UTC(2024, 2, 15, 12, 0, 0));
    const result = formatDate(date);

    expect(result).toBe(date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }));
    expect(result).toContain('marzo');
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });

  it('UT-DATE-12: maps different months to Spanish month names', () => {
    const january = formatDate(new Date(Date.UTC(2024, 0, 15, 12, 0, 0)));
    const december = formatDate(new Date(Date.UTC(2024, 11, 15, 12, 0, 0)));

    expect(january).toContain('enero');
    expect(january).not.toContain('January');
    expect(december).toContain('diciembre');
    expect(december).not.toContain('December');
  });

  it('UT-DATE-13: returns "Invalid Date" for an Invalid Date without throwing', () => {
    const invalid = new Date(NaN);

    expect(() => formatDate(invalid)).not.toThrow();
    expect(formatDate(invalid)).toBe('Invalid Date');
  });

  it('UT-DATE-14: throws TypeError when date is null or undefined', () => {
    expect(() => formatDate(null)).toThrow(TypeError);
    expect(() => formatDate(undefined)).toThrow(TypeError);
  });

  it('UT-DATE-15: throws TypeError when date is a number or string', () => {
    expect(() => formatDate(1700000000000)).toThrow(TypeError);
    expect(() => formatDate('2024-03-15')).toThrow(TypeError);
  });
});

describe('subtask-1-1: timestamp to formatted date pipeline', () => {
  it('UT-DATE-16: formats a Firebase-style timestamp as a Spanish date string', () => {
    const seconds = Date.UTC(2024, 2, 15, 12, 0, 0) / 1000;
    const nanoseconds = 250000000;
    const timestamp = { seconds, nanoseconds };

    const result = formatDate(convertTimestampToDate(timestamp));

    expect(result).toBe(formatDate(new Date(seconds * 1000 + nanoseconds / 1000000)));
    expect(result).toContain('marzo');
  });
});
