import { Module } from '@nestjs/common';
import { SofascoreService } from './sofascore.service';
import { SofascorePollingService } from './sofascore-polling.service';

@Module({
  providers: [SofascoreService, SofascorePollingService],
  controllers: [],
  exports: [SofascoreService],
})
export class SofascoreModule {}
