import { describe, expect, it } from 'vitest';
import { convertTimestampToDate, formatDate } from './utils';

describe('utilities/utils', () => {
  it('convertTimestampToDate convierte un timestamp de Firebase a Date', () => {
    const timestamp = {
      seconds: 1735689600,
      nanoseconds: 500000000,
    };

    const result = convertTimestampToDate(timestamp);

    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBe(1735689600500);
  });

  it('formatDate devuelve una fecha legible en español', () => {
    const date = new Date('2025-01-01T13:05:00Z');

    const formatted = formatDate(date);

    expect(typeof formatted).toBe('string');
    expect(formatted).toMatch(/1.*enero.*2025/i);
    expect(formatted).toMatch(/13:05|14:05|08:05|07:05/);
  });
});
