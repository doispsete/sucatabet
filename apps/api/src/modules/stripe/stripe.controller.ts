import { Controller, Post, Body, Req, Headers, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async createCheckoutSession(
    @Req() req: any,
    @Body() body: { productId: string }
  ) {
    const userId = req.user.userId;
    return this.stripeService.createCheckoutSession(userId, body.productId);
  }

  @Post('portal')
  @UseGuards(JwtAuthGuard)
  async createPortalSession(@Req() req: any) {
    const userId = req.user.userId;
    return this.stripeService.createPortalSession(userId);
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: any,
    @Headers('stripe-signature') signature: string
  ) {
    // Next.js body parser returns raw buffers if handled correctly 
    // or NestJS requires configuration to get raw body
    // Using req.rawBody or req.body depending on Nest config.
    const payload = req.rawBody || req.body;
    return this.stripeService.handleWebhook(signature, payload as any);
  }
}
