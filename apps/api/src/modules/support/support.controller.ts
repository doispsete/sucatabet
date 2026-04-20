import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @UseGuards(JwtAuthGuard)
  @Post('ticket')
  sendTicket(@Request() req, @Body() data: { name: string; whatsapp: string; reason: string; improvement: string }) {
    return this.supportService.sendTicket(req.user.userId, data);
  }
}
