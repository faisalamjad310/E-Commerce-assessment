import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

interface JwtRequest {
  user: { userId: string; email: string; role: string };
}

@ApiTags('cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get the current user\'s cart' })
  getCart(@Request() req: JwtRequest) {
    return this.cartService.getCart(req.user.userId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add an item (or increment quantity) in the cart' })
  addItem(@Request() req: JwtRequest, @Body() dto: AddItemDto) {
    return this.cartService.addItem(req.user.userId, dto);
  }

  @Patch('items/:productId')
  @ApiOperation({ summary: 'Update item quantity (0 = remove)' })
  updateItem(
    @Request() req: JwtRequest,
    @Param('productId') productId: string,
    @Body() dto: UpdateItemDto,
  ) {
    return this.cartService.updateItem(req.user.userId, productId, dto);
  }

  @Delete('items/:productId')
  @ApiOperation({ summary: 'Remove an item from the cart' })
  removeItem(@Request() req: JwtRequest, @Param('productId') productId: string) {
    return this.cartService.removeItem(req.user.userId, productId);
  }
}
