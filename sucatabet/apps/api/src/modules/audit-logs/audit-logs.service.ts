import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async log(
    action: string,
    entity: string,
    entityId: string,
    executedBy: string,
    oldValue?: any,
    newValue?: any,
    tx?: any,
  ) {
    const prisma = tx || this.prisma;
    return prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        executedBy,
        oldValue: oldValue || null,
        newValue: newValue || null,
      },
    });
  }
}
