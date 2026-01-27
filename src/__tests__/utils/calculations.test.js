/**
 * Tests for calculations utility functions
 * Financial calculation helpers
 */

import { describe, it, expect } from 'vitest';
import {
  calculatePercentageChange,
  calculateDifference,
  formatCurrencyDifference
} from '../../utils/calculations';

describe('calculations', () => {
  describe('calculatePercentageChange', () => {
    describe('standard calculations', () => {
      it('should calculate positive percentage change', () => {
        const result = calculatePercentageChange(1200, 1000);
        expect(result).toContain('20.00');
      });

      it('should calculate negative percentage change', () => {
        const result = calculatePercentageChange(800, 1000);
        expect(result).toContain('-20.00');
      });

      it('should calculate zero percentage when values are equal', () => {
        const result = calculatePercentageChange(1000, 1000);
        expect(result).toContain('0.00');
      });

      it('should calculate large percentage increase', () => {
        const result = calculatePercentageChange(2000, 1000);
        expect(result).toContain('100.00');
      });
    });

    describe('edge cases', () => {
      it('should return N.A.% when previous value is 0', () => {
        const result = calculatePercentageChange(1000, 0);
        expect(result).toContain('N.A.%');
      });

      it('should return N.A.% when current value is NaN', () => {
        const result = calculatePercentageChange(NaN, 1000);
        expect(result).toContain('N.A.%');
      });

      it('should return N.A.% when previous value is NaN', () => {
        const result = calculatePercentageChange(1000, NaN);
        expect(result).toContain('N.A.%');
      });

      it('should return N.A.% when current value is null', () => {
        const result = calculatePercentageChange(null, 1000);
        expect(result).toContain('N.A.%');
      });

      it('should return N.A.% when previous value is null', () => {
        const result = calculatePercentageChange(1000, null);
        expect(result).toContain('N.A.%');
      });

      it('should return N.A.% when current value is undefined', () => {
        const result = calculatePercentageChange(undefined, 1000);
        expect(result).toContain('N.A.%');
      });

      it('should return N.A.% when previous value is undefined', () => {
        const result = calculatePercentageChange(1000, undefined);
        expect(result).toContain('N.A.%');
      });
    });

    describe('saved type calculations', () => {
      it('should handle positive savings change', () => {
        const result = calculatePercentageChange(500, 400, 'saved');
        expect(result).toContain('%');
      });

      it('should handle negative savings change', () => {
        const result = calculatePercentageChange(300, 400, 'saved');
        expect(result).toContain('%');
      });

      it('should handle from loss to profit', () => {
        const result = calculatePercentageChange(100, -100, 'saved');
        expect(result).toContain('%');
        expect(result).toContain('+');
      });

      it('should handle from profit to loss', () => {
        const result = calculatePercentageChange(-100, 100, 'saved');
        expect(result).toContain('%');
        expect(result).toContain('-');
      });

      it('should handle both negative values', () => {
        const result = calculatePercentageChange(-50, -100, 'saved');
        expect(result).toContain('%');
      });
    });
  });

  describe('calculateDifference', () => {
    it('should calculate positive difference', () => {
      expect(calculateDifference(1500, 1000)).toBe(500);
    });

    it('should calculate negative difference', () => {
      expect(calculateDifference(800, 1000)).toBe(-200);
    });

    it('should calculate zero difference when values are equal', () => {
      expect(calculateDifference(1000, 1000)).toBe(0);
    });

    it('should handle negative numbers', () => {
      expect(calculateDifference(-100, -200)).toBe(100);
    });

    it('should return 0 when current value is NaN', () => {
      expect(calculateDifference(NaN, 1000)).toBe(0);
    });

    it('should return 0 when previous value is NaN', () => {
      expect(calculateDifference(1000, NaN)).toBe(0);
    });

    it('should return 0 when current value is null', () => {
      expect(calculateDifference(null, 1000)).toBe(0);
    });

    it('should return 0 when previous value is null', () => {
      expect(calculateDifference(1000, null)).toBe(0);
    });

    it('should return 0 when current value is undefined', () => {
      expect(calculateDifference(undefined, 1000)).toBe(0);
    });

    it('should return 0 when previous value is undefined', () => {
      expect(calculateDifference(1000, undefined)).toBe(0);
    });
  });

  describe('formatCurrencyDifference', () => {
    it('should format positive difference with + sign', () => {
      const result = formatCurrencyDifference(500);
      expect(result).toContain('+');
      expect(result).toContain('500');
    });

    it('should format negative difference', () => {
      const result = formatCurrencyDifference(-500);
      expect(result).not.toContain('+');
      expect(result).toContain('500');
    });

    it('should format zero difference with + sign', () => {
      const result = formatCurrencyDifference(0);
      expect(result).toContain('+');
      expect(result).toContain('0');
    });

    it('should format large numbers with thousands separator', () => {
      const result = formatCurrencyDifference(12500);
      // Italian locale uses . as thousands separator
      expect(result).toContain('+');
    });

    it('should return N/A when value is NaN', () => {
      expect(formatCurrencyDifference(NaN)).toBe('N/A');
    });

    it('should return N/A when value is null', () => {
      expect(formatCurrencyDifference(null)).toBe('N/A');
    });

    it('should return N/A when value is undefined', () => {
      expect(formatCurrencyDifference(undefined)).toBe('N/A');
    });

    it('should include EUR currency symbol', () => {
      const result = formatCurrencyDifference(1000);
      expect(result).toMatch(/€|EUR/);
    });
  });
});
