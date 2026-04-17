import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SofascoreService } from './sofascore.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('sofascore')
@UseGuards(JwtAuthGuard)
export class SofascoreController {
  constructor(private readonly sofascoreService: SofascoreService) {}

  @Get('search')
  async search(@Query('q') query: string) {
    if (!query || query.length < 3) {
      return [];
    }
    return this.sofascoreService.searchGames(query);
  }
}
