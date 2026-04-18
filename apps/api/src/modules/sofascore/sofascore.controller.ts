import { Controller, UseGuards } from '@nestjs/common';
import { SofascoreService } from './sofascore.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('sofascore')
@UseGuards(JwtAuthGuard)
export class SofascoreController {
  constructor(private readonly sofascoreService: SofascoreService) {}
}
