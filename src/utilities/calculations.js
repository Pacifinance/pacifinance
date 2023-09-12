export function calculatePercentageChange(currentValue, previousValue) {
    if (isNaN(currentValue) || isNaN(previousValue)) {
      return 'N.A.';
    }
  
    if (previousValue === 0) {
      return 'N.A.';
    }
  
    return `${(((currentValue - previousValue) / previousValue) * 100).toFixed(2)} %`;
}
  
 
  
  