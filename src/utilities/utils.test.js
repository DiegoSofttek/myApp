import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { convertTimestampToDate, formatDate } from './utils';

describe('utils', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, TEST_API_KEY: 'test-mock-key' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('convertTimestampToDate convierte un timestamp de Firebase a Date', () => {
    const timestamp = {
      seconds: 1714827600,
      nanoseconds: 500000000,
    };

    const result = convertTimestampToDate(timestamp);

    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBe(1714827600500);
  });

  it('formatDate devuelve una fecha legible en español', () => {
    const date = new Date(Date.UTC(2024, 4, 4, 9, 7));

    const formatted = formatDate(date);

    expect(formatted).toContain('4');
    expect(formatted.toLowerCase()).toContain('mayo');
    expect(formatted).toContain('2024');
    expect(formatted).toMatch(/09:07|9:07/);
  });
});
