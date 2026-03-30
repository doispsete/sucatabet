
/**
 * Retorna o início da semana (Segunda-feira 00:00) no fuso Horário de Brasília (UTC-3).
 * Garante consistência entre o que o usuário vê no Dashboard e o que é gravado no Banco.
 */
export function getStartOfWeekBR(now: Date = new Date()): Date {
  // Converte a data atual para o fuso de São Paulo
  const brDateStr = now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' });
  const brDate = new Date(brDateStr);
  
  const day = brDate.getDay(); // 0 (Dom) a 6 (Sab)
  
  // Diferença para chegar na Segunda-feira desta semana
  // Se for Domingo (0), recua 6 dias. Se for Segunda (1), mantém.
  const diff = brDate.getDate() - day + (day === 0 ? -6 : 1);
  
  const mondayCandidate = new Date(brDate);
  mondayCandidate.setDate(diff);
  
  // Retorna a representação em UTC de Segunda-feira 00:00 no horário de Brasília (UTC-3)
  // Segunda 00:00 BRT = Segunda 03:00 UTC
  return new Date(Date.UTC(
    mondayCandidate.getFullYear(),
    mondayCandidate.getMonth(),
    mondayCandidate.getDate(),
    3, 0, 0, 0
  ));
}
