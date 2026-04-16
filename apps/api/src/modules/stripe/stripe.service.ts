import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import Stripe from 'stripe';
import { UserRole, UserPlan } from '@prisma/client';

@Injectable()
export class StripeService {
  private stripe: any;

  constructor(private readonly prisma: PrismaService) {
    // @ts-ignore
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
  }

  async createCheckoutSession(userId: string, productId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    try {
      // Find the active price for this product
      const prices = await this.stripe.prices.list({
        product: productId,
        active: true,
        limit: 1,
      });

      if (prices.data.length === 0) {
        throw new BadRequestException('No active price found for this product');
      }

      const priceId = prices.data[0].id;

      // Handle Customer Mapping
      let customerId = (user as any).stripeCustomerId;

      if (!customerId) {
        const customer = await this.stripe.customers.create({
          email: user.email,
          name: user.name,
          metadata: { userId: user.id },
        });
        customerId = customer.id;
        await this.prisma.user.update({
          where: { id: user.id },
          data: { stripeCustomerId: customerId } as any,
        });
      }

      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${appUrl}/?billing_success=true`,
        cancel_url: `${appUrl}/?billing_cancel=true`,
        client_reference_id: userId,
        subscription_data: {
          metadata: { userId: user.id },
        },
      });

      return { url: session.url };
    } catch (error: any) {
      throw new BadRequestException(`Failed to create checkout session: ${error.message}`);
    }
  }

  async createPortalSession(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (!user || !(user as any).stripeCustomerId) {
      throw new BadRequestException('Você não possui uma assinatura ativa associada.');
    }

    try {
      const portalSession = await this.stripe.billingPortal.sessions.create({
        customer: (user as any).stripeCustomerId,
        return_url: `${appUrl}/`,
      });

      return { url: portalSession.url };
    } catch (error: any) {
      throw new BadRequestException(`Failed to create portal session: ${error.message}`);
    }
  }

  private mapProductIdToPlan(productId: string): UserPlan {
    const PRO_ID = process.env.STRIPE_PRODUCT_ID_PRO;
    const BASIC_ID = process.env.STRIPE_PRODUCT_ID_BASIC;

    if (productId === PRO_ID) return UserPlan.PRO;
    if (productId === BASIC_ID) return UserPlan.BASIC;
    return UserPlan.FREE;
  }

  async handleWebhook(signature: string, payload: Buffer) {
    console.log(`[Stripe Service] Payload type: ${typeof payload} | IsBuffer: ${Buffer.isBuffer(payload)}`);
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event: any;

    try {
      let finalPayload = payload;
      
      // FALLBACK: Se por algum motivo o middleware falhou e temos um objeto,
      // tentamos converter de volta para string para o Stripe aceitar.
      if (typeof payload === 'object' && !Buffer.isBuffer(payload)) {
        console.warn('[Stripe Service] ALERTA: Recebido objeto em vez de Buffer. Tentando stringify...');
        finalPayload = Buffer.from(JSON.stringify(payload));
      }

      if (!webhookSecret) {
        event = JSON.parse(finalPayload.toString());
      } else {
        event = this.stripe.webhooks.constructEvent(finalPayload, signature, webhookSecret);
      }
    } catch (err: any) {
      console.error(`[Stripe Service] Erro na construção do evento: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    const session = event.data.object as any;

    try {
      // 1. Checkout finalizado (Início da assinatura)
      if (event.type === 'checkout.session.completed') {
        if (session.mode === 'subscription' && session.client_reference_id) {
          const userId = session.client_reference_id;
          const subscription = await this.stripe.subscriptions.retrieve(session.subscription as string);
          const productId = subscription.items.data[0].plan.product as string;
          const plan = this.mapProductIdToPlan(productId);

          await this.prisma.user.update({
            where: { id: userId },
            data: {
              plan,
              stripeSubscriptionId: session.subscription as string,
              stripeCustomerId: session.customer as string,
            } as any,
          });
          console.log(`[Stripe Webhook] Plano atualizado para usuário ${userId}: ${plan}`);
        }
      }

      // 2. Assinatura Criada ou Atualizada (Upgrade/Downgrade/Ciclo de faturamento)
      if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
        const subscription = event.data.object as any;
        const userId = subscription.metadata?.userId;

        if (userId) {
          const productId = subscription.items.data[0].plan.product as string;
          let plan: UserPlan = UserPlan.FREE;

          if (subscription.status === 'active' || subscription.status === 'trialing') {
            plan = this.mapProductIdToPlan(productId);
          }

          await this.prisma.user.update({
            where: { id: userId },
            data: { 
              plan, 
              stripeSubscriptionId: subscription.id,
              stripeCustomerId: subscription.customer as string 
            } as any,
          });
          console.log(`[Stripe Webhook] Assinatura ${event.type} para usuário ${userId}: ${plan}`);
        }
      }

      // 3. Assinatura Deletada (Cancelamento)
      if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as any;
        const userId = subscription.metadata?.userId;

        if (userId) {
          await this.prisma.user.update({
            where: { id: userId },
            data: { 
              plan: UserPlan.FREE, 
              stripeSubscriptionId: null 
            } as any,
          });
          console.log(`[Stripe Webhook] Assinatura cancelada para usuário ${userId}. Plano revertido para FREE.`);
        }
      }
    } catch (error: any) {
      console.error(`[Stripe Webhook Error] Falha ao processar ${event.type}:`, error.message);
      // Não lançamos erro aqui para o Stripe não ficar tentando reenviar infinitamente se for erro de lógica/banco
    }

    return { received: true };
  }
}
