import { describe, it, expect } from 'vitest';
import { safeJsonParse, safeJsonStringify } from './safeJson';

describe('safeJson utils', () => {
  describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
      const json = '{"a": 1}';
      expect(safeJsonParse(json, {})).toEqual({ a: 1 });
    });

    it('should return fallback on invalid JSON', () => {
      const json = '{invalid}';
      const fallback = { error: true };
      expect(safeJsonParse(json, fallback)).toEqual(fallback);
    });

    it('should handle primitives', () => {
      expect(safeJsonParse('123', 0)).toBe(123);
      expect(safeJsonParse('"hello"', '')).toBe('hello');
    });
  });

  describe('safeJsonStringify', () => {
    it('should stringify valid data', () => {
      const data = { a: 1 };
      expect(safeJsonStringify(data)).toBe('{"a":1}');
    });

    it('should return empty string on error (e.g. circular reference)', () => {
      const circular: any = { a: 1 };
      circular.self = circular;
      expect(safeJsonStringify(circular)).toBe('');
    });
  });
});
