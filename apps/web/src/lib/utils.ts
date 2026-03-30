export const formatCurrency = (value: number | string): string => {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numericValue)) return '0,00';
  
  // Implementação robusta de formatação brasileira sem dependência de locale (ICU) para SSR
  const parts = Math.abs(numericValue).toFixed(2).split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];
  
  // Adiciona separador de milhar (.)
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  const sign = numericValue < 0 ? '-' : '';
  return `${sign}${formattedInteger},${decimalPart}`;
};

export const formatPercent = (value: number): string => {
  const numericValue = isNaN(value) ? 0 : value;
  const parts = Math.abs(numericValue).toFixed(1).split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];
  
  const sign = numericValue < 0 ? '-' : '';
  return `${sign}${integerPart},${decimalPart}%`;
};

/**
 * Formata data de forma robusta para evitar crashed de locale no Node.js (Alpine/Docker)
 * Retorna no formato DD/MM/AAAA
 */
export const formatDate = (date: Date | string | null): string => {
  if (!date) return '--/--/----';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '--/--/----';
  
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const year = d.getUTCFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Formata data curta (DD/MM)
 */
export const formatDateShort = (date: Date | string | null): string => {
  if (!date) return '--/--';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '--/--';
  
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  
  return `${day}/${month}`;
};

/**
 * Formata mês abreviado (JAN, FEV, etc)
 */
export const formatMonthAbbr = (date: Date | string | null): string => {
    if (!date) return '---';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '---';
    
    // Manual months to avoid locale dependency
    const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    // Ajuste para BRT (aproximado via UTC se necessário, mas aqui pegamos o mês do objeto Date)
    return months[d.getUTCMonth()];
};

export const formatTime = (date: Date | string | null): string => {
  if (!date) return '--:--';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '--:--';
  
  const hours = String(d.getUTCHours()).padStart(2, '0');
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  
  return `${hours}:${minutes}`;
};
