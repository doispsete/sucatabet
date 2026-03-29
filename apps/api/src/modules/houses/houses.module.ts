import { Module } from '@nestjs/common';
import { HousesController } from './houses.controller';
import { HousesService } from './houses.service';
import { PrismaService } from '../../prisma.service';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [AuditLogsModule],
  controllers: [HousesController],
  providers: [HousesService, PrismaService],
  exports: [HousesService],
})
export class HousesModule {}
