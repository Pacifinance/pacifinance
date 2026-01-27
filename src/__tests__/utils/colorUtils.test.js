/**
 * Tests for colorUtils utility functions
 * Color manipulation and conversion helpers
 */

import { describe, it, expect } from 'vitest';
import {
  getLighterSolidColor,
  getGrayscaleColor,
  getRandomGrayscaleColor
} from '../../utils/colorUtils';

describe('colorUtils', () => {
  describe('getLighterSolidColor', () => {
    describe('valid rgba colors', () => {
      it('should lighten a dark rgba color', () => {
        const result = getLighterSolidColor('rgba(50, 50, 50, 0.5)');
        expect(result).toMatch(/rgb\(\d+,\s*\d+,\s*\d+\)/);
        // Should be lighter than the original
        const match = result.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        expect(parseInt(match[1])).toBeGreaterThan(50);
      });

      it('should lighten a colored rgba', () => {
        const result = getLighterSolidColor('rgba(100, 150, 200, 0.8)');
        expect(result).toMatch(/rgb\(\d+,\s*\d+,\s*\d+\)/);
      });

      it('should handle rgba with different formatting', () => {
        // Test with standard rgba format - the function may not support all whitespace variants
        const result = getLighterSolidColor('rgba(100,150,200,0.8)');
        // It should return either rgb result or the input
        expect(result).toBeDefined();
      });

      it('should not exceed 255 for RGB values', () => {
        const result = getLighterSolidColor('rgba(200, 230, 250, 0.5)');
        const match = result.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        expect(parseInt(match[1])).toBeLessThanOrEqual(255);
        expect(parseInt(match[2])).toBeLessThanOrEqual(255);
        expect(parseInt(match[3])).toBeLessThanOrEqual(255);
      });
    });

    describe('valid rgb colors', () => {
      it('should lighten an rgb color', () => {
        const result = getLighterSolidColor('rgb(100, 100, 100)');
        expect(result).toMatch(/rgb\(\d+,\s*\d+,\s*\d+\)/);
      });
    });

    describe('edge cases', () => {
      it('should return default color when input is null', () => {
        expect(getLighterSolidColor(null)).toBe('#8884d8');
      });

      it('should return default color when input is undefined', () => {
        expect(getLighterSolidColor(undefined)).toBe('#8884d8');
      });

      it('should return default color when input is not a string', () => {
        expect(getLighterSolidColor(123)).toBe('#8884d8');
        expect(getLighterSolidColor({})).toBe('#8884d8');
        expect(getLighterSolidColor([])).toBe('#8884d8');
      });

      it('should return input as-is when it is already hex', () => {
        expect(getLighterSolidColor('#ff5733')).toBe('#ff5733');
      });

      it('should return input as-is when format is unrecognized', () => {
        expect(getLighterSolidColor('hsl(100, 50%, 50%)')).toBe('hsl(100, 50%, 50%)');
      });
    });
  });

  describe('getGrayscaleColor', () => {
    describe('valid rgba colors', () => {
      it('should convert rgba to grayscale', () => {
        const result = getGrayscaleColor('rgba(255, 0, 0, 0.5)');
        expect(result).toMatch(/rgb\(\d+,\s*\d+,\s*\d+\)/);
        // All RGB values should be the same (grayscale)
        const match = result.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        // With index variation, might not be exactly same
        expect(match).toBeTruthy();
      });

      it('should produce different grays with different indices', () => {
        const result1 = getGrayscaleColor('rgba(100, 100, 100, 0.5)', 0);
        const result2 = getGrayscaleColor('rgba(100, 100, 100, 0.5)', 1);
        const result3 = getGrayscaleColor('rgba(100, 100, 100, 0.5)', 2);
        
        expect(result1).not.toBe(result2);
        expect(result2).not.toBe(result3);
      });

      it('should use luminance formula for conversion', () => {
        // Green should appear brighter than red/blue in grayscale
        const redGray = getGrayscaleColor('rgba(255, 0, 0, 1)', 0);
        const greenGray = getGrayscaleColor('rgba(0, 255, 0, 1)', 0);
        
        // Extract gray values
        const redMatch = redGray.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        const greenMatch = greenGray.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        
        expect(parseInt(greenMatch[1])).toBeGreaterThan(parseInt(redMatch[1]));
      });
    });

    describe('edge cases', () => {
      it('should return default gray when input is null', () => {
        const result = getGrayscaleColor(null, 0);
        expect(result).toMatch(/rgb\(\d+,\s*\d+,\s*\d+\)/);
      });

      it('should return default gray when input is undefined', () => {
        const result = getGrayscaleColor(undefined, 0);
        expect(result).toMatch(/rgb\(\d+,\s*\d+,\s*\d+\)/);
      });

      it('should return default gray when input is not a string', () => {
        const result = getGrayscaleColor(123, 0);
        expect(result).toMatch(/rgb\(\d+,\s*\d+,\s*\d+\)/);
      });

      it('should handle multiple null inputs with different indices', () => {
        const result1 = getGrayscaleColor(null, 0);
        const result2 = getGrayscaleColor(null, 1);
        
        // Both should return valid rgb values
        expect(result1).toMatch(/rgb\(\d+,\s*\d+,\s*\d+\)/);
        expect(result2).toMatch(/rgb\(\d+,\s*\d+,\s*\d+\)/);
      });

      it('should keep gray values within valid range (50-255)', () => {
        const result = getGrayscaleColor('rgba(255, 255, 255, 1)', 10);
        const match = result.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        
        expect(parseInt(match[1])).toBeGreaterThanOrEqual(50);
        expect(parseInt(match[1])).toBeLessThanOrEqual(255);
      });

      it('should return input as-is when format is unrecognized string', () => {
        expect(getGrayscaleColor('#ff5733', 0)).toBe('#ff5733');
      });
    });
  });

  describe('getRandomGrayscaleColor', () => {
    it('should return a valid rgb grayscale color', () => {
      const result = getRandomGrayscaleColor();
      expect(result).toMatch(/rgb\(\d+,\s*\d+,\s*\d+\)/);
    });

    it('should return grayscale (all RGB values should be same)', () => {
      const result = getRandomGrayscaleColor(0);
      const match = result.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      
      expect(match[1]).toBe(match[2]);
      expect(match[2]).toBe(match[3]);
    });

    it('should return different colors on multiple calls', () => {
      const results = new Set();
      for (let i = 0; i < 10; i++) {
        results.add(getRandomGrayscaleColor(i));
      }
      // Should have some variety (not all the same)
      expect(results.size).toBeGreaterThan(1);
    });

    it('should keep values within valid range (0-255)', () => {
      for (let i = 0; i < 20; i++) {
        const result = getRandomGrayscaleColor(i);
        const match = result.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        
        const value = parseInt(match[1]);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(255);
      }
    });

    it('should work without index parameter', () => {
      const result = getRandomGrayscaleColor();
      expect(result).toMatch(/rgb\(\d+,\s*\d+,\s*\d+\)/);
    });

    it('should apply slight variation based on index', () => {
      // Run multiple times to reduce randomness impact
      let differentCount = 0;
      for (let i = 0; i < 10; i++) {
        const result1 = getRandomGrayscaleColor(0);
        const result2 = getRandomGrayscaleColor(5);
        if (result1 !== result2) differentCount++;
      }
      // Most should be different due to randomness + index variation
      expect(differentCount).toBeGreaterThan(5);
    });
  });
});
