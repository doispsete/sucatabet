
/**
 * Retorna o início da semana (Segunda-feira 00:00) no fuso Horário de Brasília (UTC-3).
 * Garante consistência entre o que o usuário vê no Dashboard e o que é gravado no Banco.
 */
export function getStartOfWeekBR(now: Date = new Date()): Date {
  // Trabalhamos com UTC para evitar problemas de locale no Docker (Alpine)
  // Brasília é UTC-3 (fixo no SucataBet)
  const brTime = new Date(now.getTime() - (3 * 3600000));
  
  const day = brTime.getUTCDay(); // 0 (Dom) a 6 (Sab)
  
  // Diferença para chegar na Segunda-feira desta semana
  // Se for Domingo (0), recua 6 dias. Se for Segunda (1), mantém.
  const diff = brTime.getUTCDate() - day + (day === 0 ? -6 : 1);
  
  const mondayCandidate = new Date(brTime);
  mondayCandidate.setUTCDate(diff);
  
  // Retorna a representação em UTC de Segunda-feira 00:00 no horário de Brasília (UTC-3)
  // Segunda 00:00 BRT = Segunda 03:00 UTC
  return new Date(Date.UTC(
    mondayCandidate.getUTCFullYear(),
    mondayCandidate.getUTCMonth(),
    mondayCandidate.getUTCDate(),
    3, 0, 0, 0
  ));
}
