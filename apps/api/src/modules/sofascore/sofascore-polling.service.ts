import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
@Injectable()
export class SofascorePollingService implements OnModuleInit {
  private readonly logger = new Logger(SofascorePollingService.name);
  onModuleInit() {
    this.logger.log('[Sofascore] Polling backend desativado — client-side polling ativo');
  }
}
