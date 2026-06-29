import { Injectable, BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  private readonly logger = new Logger(PaymentsService.name);

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
      apiVersion: '2026-06-24.dahlia',
    });
  }

  async createIntent(amountCents: number): Promise<{ clientSecret: string; paymentIntentId: string }> {
    try {
      const intent = await this.stripe.paymentIntents.create({
        amount: amountCents,
        currency: 'gbp',
        automatic_payment_methods: { enabled: true },
      });
      if (!intent.client_secret) {
        throw new BadRequestException('Failed to create payment intent');
      }
      return { clientSecret: intent.client_secret, paymentIntentId: intent.id };
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      if (err instanceof Stripe.errors.StripeError) {
        this.logger.error(`Stripe error [${err.type}]: ${err.message}`);
        throw new BadRequestException(`Payment error: ${err.message}`);
      }
      this.logger.error('Unexpected error creating payment intent', err);
      throw new InternalServerErrorException('Could not create payment intent');
    }
  }

  async verifyIntent(paymentIntentId: string): Promise<string> {
    try {
      const intent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      if (intent.status !== 'succeeded') {
        throw new BadRequestException(`Payment not completed (status: ${intent.status})`);
      }
      return intent.id;
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      if (err instanceof Stripe.errors.StripeError) {
        this.logger.error(`Stripe error [${err.type}]: ${err.message}`);
        throw new BadRequestException(`Payment verification error: ${err.message}`);
      }
      throw err;
    }
  }

  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    const secret = process.env.STRIPE_WEBHOOK_SECRET ?? '';
    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }
}
