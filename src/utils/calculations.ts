export function calculatePercentageChange(currentValue, previousValue, type = 'default') {
    if (isNaN(currentValue) || isNaN(previousValue) || currentValue === null || previousValue === null || currentValue === undefined || previousValue === undefined) {
      return '(N.A.%)';
    }
  
    if (previousValue === 0) {
      return ' (N.A.%)';
    }

    // For savings (saved), handle the logic differently
    if (type === 'saved') {
        const difference = currentValue - previousValue;

        // If both have the same sign, use the standard formula
        if ((currentValue >= 0 && previousValue >= 0) || (currentValue < 0 && previousValue < 0)) {
            const percentage = ((difference / Math.abs(previousValue)) * 100).toFixed(2);
            return `( ${percentage} % )`;
        }

        // If they have different signs, base the calculation on improvement/worsening
        if (difference > 0) {
            // Improvement: from loss to gain, or an increase in gain
            const percentage = ((Math.abs(difference) / Math.abs(previousValue)) * 100).toFixed(2);
            return `( +${percentage} % )`;
        } else {
            // Worsening: from gain to loss, or an increase in loss
            const percentage = ((Math.abs(difference) / Math.abs(previousValue)) * 100).toFixed(2);
            return `( -${percentage} % )`;
        }
    }

    // Standard logic for income and outflow
    const percentage = (((currentValue - previousValue) / previousValue) * 100).toFixed(2);
    return `( ${percentage} % )`;
}


export function calculateDifference(currentValue, previousValue) {
    if (isNaN(currentValue) || isNaN(previousValue) || currentValue === null || previousValue === null || currentValue === undefined || previousValue === undefined) {
      return 0;
    }
  
    return currentValue - previousValue;
}

export function formatCurrencyDifference(difference, formatter) {
    if (isNaN(difference) || difference === null || difference === undefined) {
        return 'N/A';
    }
    
    const sign = difference >= 0 ? '+' : '';
    if (formatter) {
        return sign + formatter(Math.abs(difference));
    }
    return sign + new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
    }).format(difference);
}
 
  
  