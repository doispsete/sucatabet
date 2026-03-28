import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { JobsService } from './jobs.service';
import { PrismaService } from '../../prisma.service';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuditLogsModule,
  ],
  providers: [JobsService, PrismaService],
})
export class JobsModule {}
