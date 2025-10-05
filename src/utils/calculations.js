export function calculatePercentageChange(currentValue, previousValue, type = 'default') {
    if (isNaN(currentValue) || isNaN(previousValue) || currentValue === null || previousValue === null || currentValue === undefined || previousValue === undefined) {
      return '(N.A.%)';
    }
  
    if (previousValue === 0) {
      return ' (N.A.%)';
    }

    // Per i risparmi (saved), gestiamo la logica diversamente
    if (type === 'saved') {
        const difference = currentValue - previousValue;
        
        // Se entrambi hanno lo stesso segno, usiamo la formula standard
        if ((currentValue >= 0 && previousValue >= 0) || (currentValue < 0 && previousValue < 0)) {
            const percentage = ((difference / Math.abs(previousValue)) * 100).toFixed(2);
            return `( ${percentage} % )`;
        }
        
        // Se hanno segni diversi, calcoliamo basandoci sul miglioramento/peggioramento
        if (difference > 0) {
            // Miglioramento: da perdita a guadagno, o aumento del guadagno
            const percentage = ((Math.abs(difference) / Math.abs(previousValue)) * 100).toFixed(2);
            return `( +${percentage} % )`;
        } else {
            // Peggioramento: da guadagno a perdita, o aumento della perdita
            const percentage = ((Math.abs(difference) / Math.abs(previousValue)) * 100).toFixed(2);
            return `( -${percentage} % )`;
        }
    }
  
    // Logica standard per income e outflow
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
 
  
  