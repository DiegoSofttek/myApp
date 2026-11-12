import { describe, it, expect } from 'vitest';
import { convertTimestampToDate, formatDate } from './utils.js';

const SPANISH_OPTIONS = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };

describe('subtask-1-1: convertTimestampToDate (AC-1)', () => {
  // TC-01
  it('TC-01: converts whole seconds with zero nanoseconds to a Date instance with getTime() 1700000000000', () => {
    const result = convertTimestampToDate({ seconds: 1700000000, nanoseconds: 0 });

    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBe(1700000000000);
  });

  // TC-02
  it('TC-02: converts nanoseconds to milliseconds (500,000,000 ns -> 500 ms)', () => {
    const result = convertTimestampToDate({ seconds: 0, nanoseconds: 500000000 });

    expect(result.getTime()).toBe(500);
  });

  // TC-03
  it('TC-03: combines seconds and nanoseconds (1 s + 250,000,000 ns -> 1250 ms)', () => {
    const result = convertTimestampToDate({ seconds: 1, nanoseconds: 250000000 });

    expect(result.getTime()).toBe(1250);
  });

  // TC-04
  it('TC-04: converts the epoch zero timestamp to new Date(0)', () => {
    const result = convertTimestampToDate({ seconds: 0, nanoseconds: 0 });

    expect(result).toEqual(new Date(0));
  });

  // TC-05
  it('TC-05: converts a pre-1970 timestamp (-86400 s) to -86400000 ms', () => {
    const result = convertTimestampToDate({ seconds: -86400, nanoseconds: 0 });

    expect(result.getTime()).toBe(-86400000);
  });

  // TC-06
  it('TC-06: does not mutate the input and returns a new Date object on each call', () => {
    const input = { seconds: 1700000000, nanoseconds: 123000000 };
    const snapshot = { seconds: input.seconds, nanoseconds: input.nanoseconds };

    const first = convertTimestampToDate(input);
    const second = convertTimestampToDate(input);

    expect(input).toEqual(snapshot);
    expect(first).not.toBe(second);
    expect(first.getTime()).toBe(second.getTime());
  });

  // TC-07
  it('TC-07: throws a TypeError for a null or undefined timestamp', () => {
    expect(() => convertTimestampToDate(null)).toThrow(TypeError);
    expect(() => convertTimestampToDate(undefined)).toThrow(TypeError);
  });

  // TC-08
  it('TC-08: returns an Invalid Date without throwing for an empty object', () => {
    let result;
    expect(() => {
      result = convertTimestampToDate({});
    }).not.toThrow();

    expect(result).toBeInstanceOf(Date);
    expect(isNaN(result.getTime())).toBe(true);
  });

  // TC-09
  it('TC-09: returns an Invalid Date (NaN time value) for non-numeric seconds', () => {
    const result = convertTimestampToDate({ seconds: 'abc', nanoseconds: 0 });

    expect(result).toBeInstanceOf(Date);
    expect(Number.isNaN(result.getTime())).toBe(true);
  });
});

describe('subtask-1-1: formatDate (AC-2)', () => {
  // TC-10
  it('TC-10: formats a January date as the es-ES locale string with year, "enero" and " de "', () => {
    const date = new Date(2024, 0, 15, 10, 30);

    const result = formatDate(date);

    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    expect(result).toBe(date.toLocaleDateString('es-ES', SPANISH_OPTIONS));
    expect(result).toContain('2024');
    expect(result).toContain('enero');
    expect(result).toContain(' de ');
  });

  // TC-11
  it('TC-11: formats a December date with the long Spanish month name "diciembre" and year 2023', () => {
    const date = new Date(2023, 11, 31, 23, 59);

    const result = formatDate(date);

    expect(result).toContain('diciembre');
    expect(result).toContain('2023');
  });

  // TC-12
  it('TC-12: includes a zero-padded 24-hour time component "09:05"', () => {
    const date = new Date(2024, 0, 15, 9, 5);

    const result = formatDate(date);

    expect(result).toContain('09:05');
  });

  // TC-13
  it('TC-13: formatting the output of convertTimestampToDate equals formatting the equivalent Date', () => {
    const converted = convertTimestampToDate({ seconds: 1700000000, nanoseconds: 0 });

    const result = formatDate(converted);

    expect(result).toBe(formatDate(new Date(1700000000000)));
    expect(result).toContain('2023');
  });

  // TC-14
  it('TC-14: does not throw for an Invalid Date and returns the string "Invalid Date"', () => {
    const invalid = new Date('invalid');

    let result;
    expect(() => {
      result = formatDate(invalid);
    }).not.toThrow();

    expect(result).toBe('Invalid Date');
  });

  // TC-15
  it('TC-15: throws a TypeError for null, undefined, or a string input', () => {
    const invalidInputs = [null, undefined, '2024-01-15'];

    for (const input of invalidInputs) {
      expect(() => formatDate(input)).toThrow(TypeError);
    }
  });
});
