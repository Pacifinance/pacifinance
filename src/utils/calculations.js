export function calculatePercentageChange(currentValue, previousValue) {
    if (isNaN(currentValue) || isNaN(previousValue) || currentValue === null || previousValue === null || currentValue === undefined || previousValue === undefined) {
      return '(N.A.%)';
    }
  
    if (previousValue === 0) {
      return ' (N.A.%)';
    }
  
    const percentage = (((currentValue - previousValue) / previousValue) * 100).toFixed(2);
    return `( ${percentage} % )`;
}


export function calculateDifference(currentValue, previousValue) {
    if (isNaN(currentValue) || isNaN(previousValue) || currentValue === null || previousValue === null || currentValue === undefined || previousValue === undefined) {
      return 0;
    }
  
    return currentValue - previousValue;
}

export function formatCurrencyDifference(difference) {
    if (isNaN(difference) || difference === null || difference === undefined) {
        return 'N/A';
    }
    
    const sign = difference >= 0 ? '+' : '';
    return sign + new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
    }).format(difference);
}
 
  
  