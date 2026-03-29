import { Module } from '@nestjs/common';
import { OperationsService } from './operations.service';
import { OperationsController } from './operations.controller';
import { PrismaService } from '../../prisma.service';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [AuditLogsModule],
  controllers: [OperationsController],
  providers: [OperationsService, PrismaService],
})
export class OperationsModule {}
