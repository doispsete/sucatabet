import { Module } from '@nestjs/common';
import { CpfProfilesService } from './cpf-profiles.service';
import { CpfProfilesController } from './cpf-profiles.controller';
import { PrismaService } from '../../prisma.service';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [AuditLogsModule],
  providers: [CpfProfilesService, PrismaService],
  controllers: [CpfProfilesController]
})
export class CpfProfilesModule {}
