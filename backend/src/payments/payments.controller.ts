import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { OrdersService } from '../orders/orders.service';
import { CheckoutDto } from '../orders/dto/checkout.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

interface JwtRequest {
  user: { userId: string; email: string; role: string };
}

@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly ordersService: OrdersService,
  ) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Mock checkout — creates order and returns orderId + paymentRef' })
  async checkout(@Request() req: JwtRequest, @Body() dto: CheckoutDto) {
    const { ref } = this.paymentsService.processPayment(0); // amount ignored in mock
    const order = await this.ordersService.createOrder(
      req.user.userId,
      dto.shippingAddress,
      ref,
    );
    return { orderId: order._id.toString(), paymentRef: ref };
  }
}
