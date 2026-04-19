import { Module } from '@nestjs/common';
import { OperationsService } from './operations.service';
import { OperationsController } from './operations.controller';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { SofascoreModule } from '../sofascore/sofascore.module';

@Module({
  imports: [AuditLogsModule, SofascoreModule],
  controllers: [OperationsController],
  providers: [OperationsService],
})
export class OperationsModule {}
