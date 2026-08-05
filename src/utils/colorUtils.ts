/**
 * Utility functions for color processing and manipulation
 */

/**
 * Converts rgba colors to lighter solid colors for better visibility
 * @param {string} rgbaColor - The rgba color string to lighten
 * @returns {string} - The lighter solid color
 */
export const getLighterSolidColor = (rgbaColor) => {
  if (!rgbaColor || typeof rgbaColor !== 'string') return '#8884d8';
  
  // Extract the RGB values from an rgba string and lighten them
  const match = rgbaColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    const [, r, g, b] = match.map(Number);
    // Lighten the colors by blending them with white (increases brightness)
    const lighterR = Math.min(255, Math.round(r + (255 - r) * 0.4));
    const lighterG = Math.min(255, Math.round(g + (255 - g) * 0.4));
    const lighterB = Math.min(255, Math.round(b + (255 - b) * 0.4));
    return `rgb(${lighterR}, ${lighterG}, ${lighterB})`;
  }
  
  // If it's already a hex or rgb color, return it as-is
  return rgbaColor;
};

/**
 * Converts colors to grayscale for privacy mode
 * @param {string} rgbaColor - The rgba color string to convert
 * @param {number} index - Index for variation in grayscale values
 * @returns {string} - The grayscale color
 */
export const getGrayscaleColor = (rgbaColor, index = 0) => {
  if (!rgbaColor || typeof rgbaColor !== 'string') {
    // Generate different grays based on the index
    const grayValue = 120 + (index * 25) % 100;
    return `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
  }
  
  const match = rgbaColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    const [, r, g, b] = match.map(Number);
    // Convert to grayscale using the luminance formula
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    // Add variation based on the index to distinguish sections
    const adjustedGray = Math.min(255, Math.max(50, gray + (index * 30) % 80));
    return `rgb(${adjustedGray}, ${adjustedGray}, ${adjustedGray})`;
  }
  
  return rgbaColor;
};

/**
 * Generates random grayscale colors for privacy mode
 * @param {number} index - Optional index for slight variation
 * @returns {string} - Random grayscale color
 */
export const getRandomGrayscaleColor = (index = 0) => {
  const baseGray = Math.floor(Math.random() * 256);
  // Add a slight variation based on the index, if provided
  const adjustedGray = Math.min(255, Math.max(0, baseGray + (index * 10) % 50));
  return `rgb(${adjustedGray}, ${adjustedGray}, ${adjustedGray})`;
};