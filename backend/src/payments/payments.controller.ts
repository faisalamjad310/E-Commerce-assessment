import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { OrdersService } from '../orders/orders.service';
import { CheckoutDto, GuestCheckoutDto } from '../orders/dto/checkout.dto';
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

  @Post('checkout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mock checkout — creates order and returns orderId + paymentRef' })
  async checkout(@Request() req: JwtRequest, @Body() dto: CheckoutDto) {
    const { ref } = this.paymentsService.processPayment(0);
    const order = await this.ordersService.createOrder(
      req.user.userId,
      dto.shippingAddress,
      ref,
    );
    return { orderId: order._id.toString(), paymentRef: ref };
  }

  @Post('guest-checkout')
  @ApiOperation({ summary: 'Guest checkout — no authentication required' })
  async guestCheckout(@Body() dto: GuestCheckoutDto) {
    const { ref } = this.paymentsService.processPayment(0);
    const order = await this.ordersService.createGuestOrder(
      dto.items,
      dto.shippingAddress,
      dto.guestContact,
      ref,
    );
    return { orderId: order._id.toString(), paymentRef: ref };
  }
}
