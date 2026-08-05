import {
  Utensils,
  Car,
  Plane,
  House,
  ShoppingBag,
  Heart,
  GraduationCap,
  Gamepad2,
  Briefcase,
  Gift,
  Zap,
  PiggyBank,
  TrendingUp,
  Building,
  PawPrint,
  Coffee,
  Star,
  Settings,
  Monitor,
  Smartphone
} from 'lucide-react';

// Map of icons for the categories that exist in categoryColors.js
export const categoryIcons = {
  // Income Categories
  'Salary': Briefcase,
  'Freelance income': Monitor,
  'Extra income': TrendingUp,
  'Gift': Gift,
  'Retirement': PiggyBank,

  // Outflow Categories
  'Food': Utensils,
  'House': House,
  'Health': Heart,
  'Education': GraduationCap,
  'Tax': Building,
  'Shopping': ShoppingBag,
  'Free time': Gamepad2,
  'Travelling': Plane,
  'Vehicle': Car,
  'Digital service': Smartphone,
  'Pets': PawPrint,
  'Personal project': Star,
  'Investment': TrendingUp,
  'Transports': Car,

  // Default
  'Other': Settings
};

// Function to get the icon for a category
export const getCategoryIcon = (category) => {
  // Normalize the category name (trims whitespace for matching)
  const normalizedCategory = category.replace(/\s+/g, ' ').trim();

  // Try an exact match first
  if (categoryIcons[normalizedCategory]) {
    return categoryIcons[normalizedCategory];
  }

  // Try a partial match (case-insensitive)
  const categoryKey = Object.keys(categoryIcons).find(key => 
    key.toLowerCase().includes(normalizedCategory.toLowerCase()) ||
    normalizedCategory.toLowerCase().includes(key.toLowerCase())
  );
  
  return categoryKey ? categoryIcons[categoryKey] : categoryIcons['Other'];
};

// Import the colors directly from the categoryColors file
import { outflowCategoryColors, incomeCategoryColors } from './categoryColors';

// Function to convert an rgba color to a solid hex color
const rgbaToHex = (rgbaString) => {
  // Extract the RGB values from the rgba format
  const match = rgbaString.match(/rgba?\(([^)]+)\)/);
  if (!match) return '#079164';

  const [r, g, b] = match[1].split(',').map(num => parseInt(num.trim()));

  // Convert RGB to hex
  const toHex = (n) => {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Function to get the color for a category (uses the colors from categoryColors.js directly)
export const getCategoryColor = (category) => {
  if (!category) return '#079164';

  // Try outflowCategoryColors first
  let color = outflowCategoryColors[category];

  // If not found, try incomeCategoryColors
  if (!color) {
    color = incomeCategoryColors[category];
  }

  // If still not found, try the alternative mappings
  if (!color) {
    const keyMappings = {
      'food': 'Food',
      'house': 'House', 
      'health': 'Health',
      'education': 'Education',
      'tax': 'Tax',
      'shopping': 'Shopping',
      'freetime': 'Free time',
      'travelling': 'Travelling',
      'vehicle': 'Vehicle',
      'digitalservice': 'Digital service',
      'gift': 'Gift',
      'pets': 'Pets',
      'personalproject': 'Personal project',
      'investment': 'Investment',
      'transports': 'Transports',
      'other': 'Other',
      'salary': 'Salary',
      'freelanceincome': 'Freelance income',
      'extraincome': 'Extra income',
      'retirement': 'Retirement'
    };
    
    const mappedKey = keyMappings[category.toLowerCase()];
    if (mappedKey) {
      color = outflowCategoryColors[mappedKey] || incomeCategoryColors[mappedKey];
    }
  }
  
  // Convert rgba to hex if needed
  if (color && color.startsWith('rgba')) {
    return rgbaToHex(color);
  }

  // Fall back to the default color
  return color || '#079164';
};

export default categoryIcons;