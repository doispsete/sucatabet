import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class AuditLogsService {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(private prisma: PrismaService) { }

  log(
    action: string,
    entity: string,
    entityId: string,
    executedBy: string,
    oldValue?: any,
    newValue?: any,
  ): void {
    // Fire and forget — não bloqueia a transação principal
    this.prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        executedBy,
        oldValue: oldValue || null,
        newValue: newValue || null,
      },
    }).catch((err) => {
      this.logger.error(`Failed to write audit log: ${err.message}`);
    });
  }
}