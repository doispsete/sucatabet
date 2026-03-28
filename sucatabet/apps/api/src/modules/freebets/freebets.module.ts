import { Module } from '@nestjs/common';
import { FreebetsService } from './freebets.service';
import { FreebetsController } from './freebets.controller';
import { PrismaService } from '../../prisma.service';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [AuditLogsModule],
  controllers: [FreebetsController],
  providers: [FreebetsService, PrismaService],
})
export class FreebetsModule {}
