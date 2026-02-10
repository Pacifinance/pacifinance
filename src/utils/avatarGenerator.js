/**
 * Avatar Generator for PaciFinance
 * 
 * Generates unique, cute but professional circular avatars with:
 * - Random background color from a curated palette that fits the platform
 * - Two eyes (circles, dashes, or 'o' shapes)
 * - One mouth (letters like T, B, D, U, or simple shapes)
 * 
 * Stored in localStorage, regenerable once per day.
 */

const STORAGE_KEY = 'pacifinance-avatar';
const REGEN_DATE_KEY = 'pacifinance-avatar-regen-date';

// Curated colors that work well with PaciFinance's green (#079164) theme
// Mix of soft, professional colors that look good as avatar backgrounds
const AVATAR_COLORS = [
  '#079164', // PaciFinance green
  '#0D579B', // Bank blue
  '#2980b9', // Light blue
  '#8e44ad', // Purple
  '#a29bfe', // Lavender
  '#FF6600', // Orange
  '#e17055', // Coral
  '#00b894', // Mint
  '#6c5ce7', // Indigo
  '#d63031', // Red
  '#fdcb6e', // Gold
  '#00cec9', // Teal
  '#636e72', // Slate
  '#2d3436', // Dark gray
  '#55a68a', // Sage green
  '#4a90d9', // Sky blue
  '#c0392b', // Crimson
  '#f39c12', // Amber
  '#1abc9c', // Turquoise
  '#9b59b6', // Amethyst
];

// Eye variants: each is a function that draws on canvas context
const EYE_STYLES = [
  // Solid circles
  (ctx, x, y, size) => {
    ctx.beginPath();
    ctx.arc(x, y, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
  },
  // Open circles (o shape)
  (ctx, x, y, size) => {
    ctx.beginPath();
    ctx.arc(x, y, size * 0.07, 0, Math.PI * 2);
    ctx.lineWidth = size * 0.02;
    ctx.stroke();
  },
  // Horizontal dashes
  (ctx, x, y, size) => {
    ctx.lineWidth = size * 0.03;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - size * 0.06, y);
    ctx.lineTo(x + size * 0.06, y);
    ctx.stroke();
  },
  // Dots (small filled circles)
  (ctx, x, y, size) => {
    ctx.beginPath();
    ctx.arc(x, y, size * 0.04, 0, Math.PI * 2);
    ctx.fill();
  },
  // Semi-closed eyes (arcs)
  (ctx, x, y, size) => {
    ctx.lineWidth = size * 0.025;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.06, 0, Math.PI);
    ctx.stroke();
  },
  // Vertical ovals
  (ctx, x, y, size) => {
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.04, size * 0.07, 0, 0, Math.PI * 2);
    ctx.fill();
  },
  // X eyes (playful)
  (ctx, x, y, size) => {
    ctx.lineWidth = size * 0.02;
    ctx.lineCap = 'round';
    const s = size * 0.045;
    ctx.beginPath();
    ctx.moveTo(x - s, y - s);
    ctx.lineTo(x + s, y + s);
    ctx.moveTo(x + s, y - s);
    ctx.lineTo(x - s, y + s);
    ctx.stroke();
  },
];

// Mouth variants: each is a function that draws on canvas context
const MOUTH_STYLES = [
  // Letter "T"
  (ctx, x, y, size) => {
    ctx.font = `bold ${size * 0.18}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('T', x, y);
  },
  // Letter "B"
  (ctx, x, y, size) => {
    ctx.font = `bold ${size * 0.18}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('B', x, y);
  },
  // Letter "D"
  (ctx, x, y, size) => {
    ctx.font = `bold ${size * 0.18}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('D', x, y);
  },
  // Letter "U"
  (ctx, x, y, size) => {
    ctx.font = `bold ${size * 0.18}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('U', x, y);
  },
  // Letter "w"
  (ctx, x, y, size) => {
    ctx.font = `bold ${size * 0.16}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('w', x, y);
  },
  // Simple smile (arc)
  (ctx, x, y, size) => {
    ctx.lineWidth = size * 0.025;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(x, y - size * 0.03, size * 0.1, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
  },
  // Straight line
  (ctx, x, y, size) => {
    ctx.lineWidth = size * 0.025;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - size * 0.08, y);
    ctx.lineTo(x + size * 0.08, y);
    ctx.stroke();
  },
  // Small open circle (o mouth)
  (ctx, x, y, size) => {
    ctx.beginPath();
    ctx.arc(x, y, size * 0.05, 0, Math.PI * 2);
    ctx.lineWidth = size * 0.02;
    ctx.stroke();
  },
  // Wide smile
  (ctx, x, y, size) => {
    ctx.lineWidth = size * 0.025;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(x, y - size * 0.05, size * 0.13, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  },
  // Letter "3" (like a sideways lips)
  (ctx, x, y, size) => {
    ctx.font = `bold ${size * 0.15}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('3', x, y);
  },
];

/**
 * Determines if a color is light or dark to choose contrasting face color
 */
function isLightColor(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55;
}

/**
 * Generates a random avatar and returns a data URL
 * @param {number} size - Canvas size in pixels (default 200)
 * @returns {string} Base64 data URL of the avatar
 */
export function generateAvatar(size = 200) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Pick random color
  const bgColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
  const faceColor = isLightColor(bgColor) ? '#2d3436' : '#ffffff';

  // Draw circle background
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fillStyle = bgColor;
  ctx.fill();

  // Set face color
  ctx.fillStyle = faceColor;
  ctx.strokeStyle = faceColor;

  // Draw eyes
  const eyeStyle = EYE_STYLES[Math.floor(Math.random() * EYE_STYLES.length)];
  const eyeY = size * 0.38;
  const eyeSpacing = size * 0.16;
  eyeStyle(ctx, size / 2 - eyeSpacing, eyeY, size);
  eyeStyle(ctx, size / 2 + eyeSpacing, eyeY, size);

  // Draw mouth
  const mouthStyle = MOUTH_STYLES[Math.floor(Math.random() * MOUTH_STYLES.length)];
  const mouthY = size * 0.62;
  mouthStyle(ctx, size / 2, mouthY, size);

  return canvas.toDataURL('image/png');
}

/**
 * Gets the current avatar from localStorage, or generates a new one
 * @returns {string} Base64 data URL of the avatar
 */
export function getAvatar() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return stored;
  
  // Generate and store a new avatar
  const avatar = generateAvatar();
  localStorage.setItem(STORAGE_KEY, avatar);
  return avatar;
}

/**
 * Checks if the user can regenerate their avatar today
 * @returns {boolean}
 */
export function canRegenerateAvatar() {
  const lastRegen = localStorage.getItem(REGEN_DATE_KEY);
  if (!lastRegen) return true;
  
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return lastRegen !== today;
}

/**
 * Regenerates the avatar if allowed (once per day)
 * @returns {{ success: boolean, avatar: string }} Result with new avatar data URL
 */
export function regenerateAvatar() {
  if (!canRegenerateAvatar()) {
    return { success: false, avatar: getAvatar() };
  }
  
  const avatar = generateAvatar();
  const today = new Date().toISOString().split('T')[0];
  
  localStorage.setItem(STORAGE_KEY, avatar);
  localStorage.setItem(REGEN_DATE_KEY, today);
  
  return { success: true, avatar };
}

/**
 * Gets the date when the avatar was last regenerated
 * @returns {string|null} Date string (YYYY-MM-DD) or null
 */
export function getLastRegenDate() {
  return localStorage.getItem(REGEN_DATE_KEY);
}
