import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { PrismaService } from '../../prisma.service';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [AuditLogsModule],
  controllers: [AccountsController],
  providers: [AccountsService, PrismaService],
})
export class AccountsModule {}
