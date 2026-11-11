import { describe, it, expect } from 'vitest';
import { convertTimestampToDate, formatDate } from './utils';

const DATE_OPTIONS = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

describe('subtask-1-1: convertTimestampToDate', () => {
  it('TC-1-1-01: returns a Date at epoch 0 for {seconds:0, nanoseconds:0}', () => {
    const result = convertTimestampToDate({ seconds: 0, nanoseconds: 0 });

    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBe(0);
  });

  it('TC-1-1-02: converts a whole-second Firebase timestamp to the expected instant', () => {
    const result = convertTimestampToDate({ seconds: 1705314600, nanoseconds: 0 });

    expect(result.getTime()).toBe(1705314600000);
    expect(result.toISOString()).toBe('2024-01-15T10:30:00.000Z');
  });

  it('TC-1-1-03: converts nanoseconds that are whole milliseconds', () => {
    const result = convertTimestampToDate({ seconds: 1, nanoseconds: 500000000 });

    expect(result.getTime()).toBe(1500);
  });

  it('TC-1-1-04: truncates sub-millisecond nanoseconds', () => {
    const result = convertTimestampToDate({ seconds: 1, nanoseconds: 1500000 });

    expect(result.getTime()).toBe(1001);
  });

  it('TC-1-1-05: converts negative (pre-epoch) seconds', () => {
    const result = convertTimestampToDate({ seconds: -86400, nanoseconds: 0 });

    expect(result.getTime()).toBe(-86400000);
    expect(result.toISOString()).toBe('1969-12-31T00:00:00.000Z');
  });

  it('TC-1-1-06: returns an Invalid Date when seconds and nanoseconds are missing', () => {
    const result = convertTimestampToDate({});

    expect(result).toBeInstanceOf(Date);
    expect(Number.isNaN(result.getTime())).toBe(true);
  });

  it('TC-1-1-07: throws TypeError when the argument is null or undefined', () => {
    expect(() => convertTimestampToDate(null)).toThrow(TypeError);
    expect(() => convertTimestampToDate(undefined)).toThrow(TypeError);
  });
});

describe('subtask-1-1: formatDate', () => {
  it('TC-1-1-08: formats a fixed local date with Spanish long-month output', () => {
    const date = new Date(2024, 0, 15, 10, 30);
    const result = formatDate(date);

    expect(result).toBe(date.toLocaleDateString('es-ES', DATE_OPTIONS));
    expect(result).toContain('2024');
    expect(result).toContain('enero');
    expect(result).toContain('10:30');
  });

  it('TC-1-1-09: formats a November date in Spanish without English month names', () => {
    const result = formatDate(new Date(2023, 10, 5, 8, 5));

    expect(result).toContain('noviembre');
    expect(result).toContain('2023');
    expect(result).not.toContain('November');
  });

  it('TC-1-1-10: formats a date produced by convertTimestampToDate from a local-time timestamp', () => {
    const localDate = new Date(2024, 0, 15, 10, 30);
    const timestamp = { seconds: Math.floor(localDate.getTime() / 1000), nanoseconds: 0 };

    const result = formatDate(convertTimestampToDate(timestamp));

    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain('15');
    expect(result).toContain('enero');
    expect(result).toContain('2024');
    expect(result).toContain('10:30');
  });

  it('TC-1-1-11: returns the string "Invalid Date" for an Invalid Date without throwing', () => {
    let result;

    expect(() => {
      result = formatDate(new Date('invalid'));
    }).not.toThrow();
    expect(result).toBe('Invalid Date');
  });

  it('TC-1-1-12: throws TypeError when the argument is null or undefined', () => {
    expect(() => formatDate(null)).toThrow(TypeError);
    expect(() => formatDate(undefined)).toThrow(TypeError);
  });

  it('TC-1-1-13: returns a string primitive for a valid Date', () => {
    const result = formatDate(new Date(2024, 0, 15, 10, 30));

    expect(typeof result).toBe('string');
  });
});
