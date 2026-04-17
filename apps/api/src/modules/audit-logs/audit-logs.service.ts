import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class AuditLogsService {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(private prisma: PrismaService) { }

  private maskSensitiveFields(data: any): any {
    if (!data || typeof data !== 'object') return data;

    // Deep clone para evitar mutação indesejada
    const masked = Array.isArray(data) ? [...data] : { ...data };

    const sensitiveKeys = [
      'password', 'passwordHash', 'cpf', 'document', 'token', 
      'secret', 'stripeCustomerId', 'stripeSubscriptionId', 
      'accessToken', 'refreshToken'
    ];

    for (const key in masked) {
      if (typeof masked[key] === 'object' && masked[key] !== null) {
        masked[key] = this.maskSensitiveFields(masked[key]);
      } else if (sensitiveKeys.includes(key)) {
        if (key === 'cpf') {
          masked[key] = '***.***.***-**';
        } else if (typeof masked[key] === 'string' && masked[key].length > 10) {
          masked[key] = '***';
        } else {
          masked[key] = '***';
        }
      }
    }
    return masked;
  }

  log(
    action: string,
    entity: string,
    entityId: string,
    executedBy: string,
    oldValue?: any,
    newValue?: any,
  ): void {
    const maskedOld = oldValue ? this.maskSensitiveFields(oldValue) : null;
    const maskedNew = newValue ? this.maskSensitiveFields(newValue) : null;

    // Fire and forget — não bloqueia a transação principal
    this.prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        executedBy,
        oldValue: maskedOld,
        newValue: maskedNew,
      },
    }).catch((err) => {
      this.logger.error(`Failed to write audit log: ${err.message}`);
    });
  }
}