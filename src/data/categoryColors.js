// src/data/categoryColors.js

export const incomeCategoryColors = {
  // Necessari/positivi
  'Salary': 'rgba(39, 174, 96, 0.35)', // verde: sicurezza, stabilità
  'Freelance income': 'rgba(52, 152, 219, 0.32)', // blu: fiducia, professionalità
  'Extra income': 'rgba(241, 196, 15, 0.32)', // giallo: energia, positività
  'Gift': 'rgba(155, 89, 182, 0.28)', // viola: sorpresa, regalo
  'Retirement': 'rgba(127, 140, 141, 0.28)', // grigio: neutralità
  'Other': 'rgba(230, 126, 34, 0.32)', // arancione: creatività
};

export const outflowCategoryColors = {
  // Necessari/positivi
  'Food': 'rgba(39, 174, 96, 0.32)', // verde: salute, necessità
  'House': 'rgba(46, 196, 182, 0.32)', // turchese: sicurezza, casa
  'Health': 'rgba(231, 76, 60, 0.28)', // rosso: attenzione, salute
  'Education': 'rgba(52, 152, 219, 0.32)', // blu: crescita
  'Tax': 'rgba(52, 73, 94, 0.28)', // grigio scuro: obbligo
  // Meno necessari/voluttuari
  'Shopping': 'rgba(241, 196, 15, 0.32)', // giallo: piacere
  'Free time': 'rgba(155, 89, 182, 0.28)', // viola: svago
  'Travelling': 'rgba(46, 204, 113, 0.32)', // verde chiaro: libertà
  'Vehicle': 'rgba(230, 126, 34, 0.32)', // arancione: movimento
  'Digital service': 'rgba(203, 243, 240, 0.32)', // azzurro chiaro: tecnologia
  'Gift': 'rgba(255, 99, 132, 0.28)', // rosa/rosso: dono
  'Pets': 'rgba(255, 206, 86, 0.28)', // giallo chiaro: affetto
  'Personal project': 'rgba(255, 115, 0, 0.38)', // arancione acceso: creatività, motivazione, risalto
  'Investment': 'rgba(39, 174, 96, 0.22)', // verde: crescita
  'Transports': 'rgba(52, 73, 94, 0.22)', // grigio scuro: spostamenti
  'Other': 'rgba(127, 140, 141, 0.22)', // grigio: altro
};

// Mapping dalle chiavi inglesi (usate nei dati) alle chiavi inglesi (usate per i colori)
export const categoryKeyMapping = {
  'Home': 'House',
  'Food': 'Food',
  'Transport': 'Transports',
  'Entertainment': 'Free time',
  'Health': 'Health',
  'Clothing': 'Shopping',
  'Other': 'Other',
  'Travel': 'Travelling',
  'Digital': 'Digital service',
  'Car': 'Vehicle'
};

// Funzione helper per ottenere il colore dalla chiave inglese
export const getCategoryColor = (englishKey) => {
  const colorKey = categoryKeyMapping[englishKey];
  return outflowCategoryColors[colorKey] || outflowCategoryColors['Other'] || '#8884d8';
};