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
  
  // Estrae i valori RGB da una stringa rgba e li rende più chiari
  const match = rgbaColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    const [, r, g, b] = match.map(Number);
    // Rende i colori più chiari mescolandoli con il bianco (aumenta luminosità)
    const lighterR = Math.min(255, Math.round(r + (255 - r) * 0.4));
    const lighterG = Math.min(255, Math.round(g + (255 - g) * 0.4));
    const lighterB = Math.min(255, Math.round(b + (255 - b) * 0.4));
    return `rgb(${lighterR}, ${lighterG}, ${lighterB})`;
  }
  
  // Se è già un colore hex o rgb, restituiscilo così com'è
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
    // Genera grigi diversi basati sull'indice
    const grayValue = 120 + (index * 25) % 100;
    return `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
  }
  
  const match = rgbaColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    const [, r, g, b] = match.map(Number);
    // Converti in scala di grigi usando la formula di luminanza
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    // Aggiungi variazione basata sull'indice per distinguere le sezioni
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
  // Aggiungi una leggera variazione basata sull'indice se fornito
  const adjustedGray = Math.min(255, Math.max(0, baseGray + (index * 10) % 50));
  return `rgb(${adjustedGray}, ${adjustedGray}, ${adjustedGray})`;
};