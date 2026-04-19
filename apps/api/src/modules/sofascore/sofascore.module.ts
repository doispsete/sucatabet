import { Module } from '@nestjs/common';
import { SofascoreService } from './sofascore.service';
import { SofascoreController } from './sofascore.controller';
import { SofascorePollingService } from './sofascore-polling.service';

@Module({
  providers: [SofascoreService, SofascorePollingService],
  controllers: [SofascoreController],
  exports: [SofascoreService],
})
export class SofascoreModule {}
