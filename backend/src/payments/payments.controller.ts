import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Headers,
  Req,
  BadRequestException,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { OrdersService } from '../orders/orders.service';
import { CheckoutDto, GuestCheckoutDto, CreateIntentDto } from '../orders/dto/checkout.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

interface JwtRequest {
  user: { userId: string; email: string; role: string };
}

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly ordersService: OrdersService,
  ) {}

  // ── Create PaymentIntent (authenticated) ────────────────────────────────────
  @Post('create-intent')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a Stripe PaymentIntent for the cart total' })
  async createIntent(@Body() dto: CreateIntentDto) {
    return this.paymentsService.createIntent(dto.amount);
  }

  // ── Create PaymentIntent (guest) ────────────────────────────────────────────
  @Post('create-intent/guest')
  @ApiOperation({ summary: 'Create a Stripe PaymentIntent for a guest cart total' })
  async createIntentGuest(@Body() dto: CreateIntentDto) {
    return this.paymentsService.createIntent(dto.amount);
  }

  // ── Finalise checkout (authenticated) ───────────────────────────────────────
  @Post('checkout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Verify Stripe payment and create order' })
  async checkout(@Request() req: JwtRequest, @Body() dto: CheckoutDto) {
    const paymentRef = await this.paymentsService.verifyIntent(dto.paymentIntentId);
    const order = await this.ordersService.createOrder(
      req.user.userId,
      dto.shippingAddress,
      paymentRef,
    );
    return { orderId: order._id.toString(), paymentRef };
  }

  // ── Finalise checkout (guest) ────────────────────────────────────────────────
  @Post('guest-checkout')
  @ApiOperation({ summary: 'Verify Stripe payment and create guest order' })
  async guestCheckout(@Body() dto: GuestCheckoutDto) {
    const paymentRef = await this.paymentsService.verifyIntent(dto.paymentIntentId);
    const order = await this.ordersService.createGuestOrder(
      dto.items,
      dto.shippingAddress,
      dto.guestContact,
      paymentRef,
    );
    return { orderId: order._id.toString(), paymentRef };
  }

  // ── Stripe webhook ───────────────────────────────────────────────────────────
  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook — receives payment events' })
  async webhook(
    @Req() req: ExpressRequest & { rawBody?: Buffer },
    @Headers('stripe-signature') sig: string,
  ) {
    if (!sig) throw new BadRequestException('Missing stripe-signature header');
    const raw = (req as ExpressRequest & { rawBody?: Buffer }).rawBody;
    if (!raw) throw new BadRequestException('Missing raw body');

    let event;
    try {
      event = this.paymentsService.constructWebhookEvent(raw, sig);
    } catch {
      throw new BadRequestException('Webhook signature verification failed');
    }

    // Handle events as needed (currently payment confirmation is done inline)
    if (event.type === 'payment_intent.succeeded') {
      // Order is already created in the checkout endpoint; this is for logging/reconciliation
    }

    return { received: true };
  }
}
