import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AdminOrdersQueryDto } from './dto/admin-orders-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

interface JwtRequest {
  user: { userId: string; email: string; role: string };
}

@ApiTags('orders')
@ApiBearerAuth()
@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ── Customer routes ────────────────────────────────────────────────────────

  @Get('orders')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get order history for the current user' })
  getMyOrders(@Request() req: JwtRequest) {
    return this.ordersService.findUserOrders(req.user.userId);
  }

  @Get('orders/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a single order (must belong to current user)' })
  getOrder(@Request() req: JwtRequest, @Param('id') id: string) {
    return this.ordersService.findOneUserOrder(id, req.user.userId);
  }

  // ── Admin routes ───────────────────────────────────────────────────────────

  @Get('admin/dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] Get dashboard statistics' })
  getDashboardStats() {
    return this.ordersService.getDashboardStats();
  }

  @Get('admin/orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] List all orders with optional status filter' })
  getAllOrders(@Query() query: AdminOrdersQueryDto) {
    return this.ordersService.findAllOrders(query);
  }

  @Patch('admin/orders/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '[Admin] Update order status' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }
}
