import { Module } from '@nestjs/common';
import { SofascoreService } from './sofascore.service';
import { SofascoreController } from './sofascore.controller';
import { SofascorePollingService } from './sofascore-polling.service';
import { PrismaService } from '../../prisma.service';

@Module({
  providers: [SofascoreService, SofascorePollingService, PrismaService],
  controllers: [SofascoreController],
  exports: [SofascoreService],
})
export class SofascoreModule {}
