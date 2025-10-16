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
  Smartphone,
  Wifi
} from 'lucide-react';

// Mappa delle icone per le categorie esistenti in categoryColors.js
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

// Funzione per ottenere l'icona di una categoria
export const getCategoryIcon = (category) => {
  // Normalizza il nome della categoria (rimuove spazi e converte in lowercase per il matching)
  const normalizedCategory = category.replace(/\s+/g, ' ').trim();
  
  // Cerca prima una corrispondenza esatta
  if (categoryIcons[normalizedCategory]) {
    return categoryIcons[normalizedCategory];
  }
  
  // Cerca una corrispondenza parziale (case-insensitive)
  const categoryKey = Object.keys(categoryIcons).find(key => 
    key.toLowerCase().includes(normalizedCategory.toLowerCase()) ||
    normalizedCategory.toLowerCase().includes(key.toLowerCase())
  );
  
  return categoryKey ? categoryIcons[categoryKey] : categoryIcons['Other'];
};

// Importiamo i colori direttamente dal file categoryColors
import { outflowCategoryColors, incomeCategoryColors } from './categoryColors';

// Funzione per convertire colore rgba in colore esadecimale solido
const rgbaToHex = (rgbaString) => {
  // Estrae i valori RGB dal formato rgba
  const match = rgbaString.match(/rgba?\(([^)]+)\)/);
  if (!match) return '#079164';
  
  const [r, g, b] = match[1].split(',').map(num => parseInt(num.trim()));
  
  // Converte RGB in esadecimale
  const toHex = (n) => {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Funzione per ottenere il colore di una categoria (usa direttamente i colori da categoryColors.js)
export const getCategoryColor = (category, index = 0) => {
  if (!category) return '#079164';
  
  // Cerca prima in outflowCategoryColors
  let color = outflowCategoryColors[category];
  
  // Se non trovato, cerca in incomeCategoryColors  
  if (!color) {
    color = incomeCategoryColors[category];
  }
  
  // Se non trovato, prova con i mapping alternativi
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
  
  // Converte rgba in esadecimale se necessario
  if (color && color.startsWith('rgba')) {
    return rgbaToHex(color);
  }
  
  // Fallback al colore di default
  return color || '#079164';
};

export default categoryIcons;