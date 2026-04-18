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
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
};

/**
 * Formata data curta (DD/MM)
 */
export const formatDateShort = (date: Date | string | null): string => {
  if (!date) return '--/--';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '--/--';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  
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
    return months[d.getMonth()];
};

export const formatTime = (date: Date | string | null): string => {
  if (!date) return '--:--';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '--:--';
  
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${hours}:${minutes}`;
};

export const formatCpf6 = (cpf: string): string => {
  if (!cpf) return "---.---";
  const digits = cpf.replace(/\D/g, '').slice(0, 6);
  return digits.replace(/(\d{3})(\d{0,3})/, (_, p1, p2) => p1 + (p2 ? '.' + p2 : ''));
};

export const formatRelativeDate = (date: Date | string | null): string => {
  if (!date) return 'Nunca';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return 'Nunca';

  const now = new Date();
  const diffInMs = now.getTime() - d.getTime();
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSecs < 60) return 'Agora mesmo';
  if (diffInMins < 60) return `há ${diffInMins} min`;
  if (diffInHours < 24) return `há ${diffInHours}h`;
  if (diffInDays === 1) return 'Ontem';
  if (diffInDays < 7) return `há ${diffInDays} dias`;
  
  return formatDate(d);
};
