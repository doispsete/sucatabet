import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);
  private readonly botToken = '8545499747:AAEQNfgcksAicM1FIqt1d_4MIsoUWL9-_SY';
  private readonly chatId = '8729910172';

  constructor(private readonly prisma: PrismaService) {}

  async sendTicket(userId: string, data: { name: string; whatsapp: string; reason: string; improvement: string }) {
    try {
      if (!userId) {
        throw new Error('ID do usuário não fornecido');
      }

      const user = await this.prisma.user.findUnique({ 
        where: { id: userId }, 
        select: { plan: true, email: true } 
      });

      if (!user) {
        throw new Error('Usuário não encontrado no banco de dados');
      }

      const plan = user?.plan || 'FREE';
      const isPriority = plan === 'PRO';

      // Sanitize inputs for HTML parse_mode
      const escape = (text: string) => (text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      const safeName = escape(data.name);
      const safeWhatsapp = escape(data.whatsapp);
      const safeReason = escape(data.reason);
      const safeImprovement = escape(data.improvement);

      const message = `
<b>🚀 Novo Ticket de Suporte - SucataBet</b>
━━━━━━━━━━━━━━━━━━━━━━━━
👤 <b>Nome:</b> ${safeName}
📧 <b>Email:</b> ${user.email}
📱 <b>WhatsApp:</b> ${safeWhatsapp}
💎 <b>Plano:</b> ${plan} ${isPriority ? '⭐ (PRIORIDADE)' : ''}

📝 <b>Motivo:</b>
${safeReason}

💡 <b>Sugestão de Melhoria:</b>
${safeImprovement}
━━━━━━━━━━━━━━━━━━━━━━━━
`;

      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Telegram API Error: ${response.status} - ${errorText}`);
        return { success: false, message: `Erro no Telegram: ${response.status} - ${errorText}` };
      }

      return { success: true };
    } catch (error) {
      this.logger.error(`Falha no serviço de suporte: ${error.message}`);
      return { success: false, message: `Erro interno: ${error.message}` };
    }
  }
}
