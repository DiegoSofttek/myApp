import { describe, expect, it, vi } from 'vitest';
import { convertTimestampToDate, formatDate } from './utils';

const spanishDateOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

describe('date utilities (subtask-1-1)', () => {
  it('subtask-1-1-TC01 converts a Firebase-compatible timestamp containing seconds and nanoseconds', () => {
    const timestamp = { seconds: 1_710_000_000, nanoseconds: 123_456_789 };

    const result = convertTimestampToDate(timestamp);

    const sourceMilliseconds =
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1_000_000;

    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBe(new Date(sourceMilliseconds).getTime());
  });

  it('subtask-1-1-TC02 converts boundary-valid Firebase timestamp values', () => {
    const epoch = convertTimestampToDate({ seconds: 0, nanoseconds: 0 });
    const preEpoch = convertTimestampToDate({ seconds: -1, nanoseconds: 0 });

    expect(epoch).toBeInstanceOf(Date);
    expect(epoch.getTime()).toBe(0);
    expect(preEpoch).toBeInstanceOf(Date);
    expect(preEpoch.getTime()).toBe(-1000);
  });

  it('subtask-1-1-TC03 handles malformed timestamp fields under the current utility contract', () => {
    const nonNumericSeconds = convertTimestampToDate({
      seconds: 'not-a-number',
      nanoseconds: 0,
    });
    const nonNumericNanoseconds = convertTimestampToDate({
      seconds: 1,
      nanoseconds: 'not-a-number',
    });
    const omittedSeconds = convertTimestampToDate({ nanoseconds: 0 });
    const omittedNanoseconds = convertTimestampToDate({ seconds: 1 });

    expect(Number.isNaN(nonNumericSeconds.getTime())).toBe(true);
    expect(Number.isNaN(nonNumericNanoseconds.getTime())).toBe(true);
    expect(Number.isNaN(omittedSeconds.getTime())).toBe(true);
    expect(Number.isNaN(omittedNanoseconds.getTime())).toBe(true);
    expect(() => convertTimestampToDate()).toThrow();
  });

  it('subtask-1-1-TC04 formats a valid fixed Date with the Spanish locale and configured readable fields', () => {
    const date = new Date(1_710_000_000_000);
    const expected = date.toLocaleDateString('es-ES', spanishDateOptions);
    const localeDateSpy = vi.spyOn(Date.prototype, 'toLocaleDateString');

    const result = formatDate(date);

    expect(localeDateSpy).toHaveBeenCalledWith('es-ES', spanishDateOptions);
    expect(result).toEqual(expected);
    expect(typeof result).toBe('string');

    localeDateSpy.mockRestore();
  });

  it('subtask-1-1-TC05 exposes current invalid formatting behavior', () => {
    const invalidDate = new Date(Number.NaN);
    const expected = invalidDate.toLocaleDateString('es-ES', spanishDateOptions);

    expect(formatDate(invalidDate)).toBe(expected);
    expect(expected).toBe('Invalid Date');
    expect(() => formatDate(null)).toThrow();
    expect(() => formatDate(undefined)).toThrow();
  });
});
