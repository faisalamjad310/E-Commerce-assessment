import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { ShippingAddressDto, GuestContactDto, GuestCheckoutItemDto } from './dto/checkout.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { AdminOrdersQueryDto } from './dto/admin-orders-query.dto';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private cartService: CartService,
    private productsService: ProductsService,
  ) {}

  async createOrder(
    userId: string,
    shippingAddress: ShippingAddressDto,
    paymentRef: string,
  ): Promise<OrderDocument> {
    // 1. Fetch current cart (populated with live product data)
    const cart = await this.cartService.getCart(userId);
    if (!cart.items.length) {
      throw new BadRequestException('Cart is empty');
    }

    // 2. Atomically decrement stock for every item — fail fast if any item is under-stocked
    const snapshotItems: {
      productId: string;
      name: string;
      priceAtOrder: number;
      quantity: number;
    }[] = [];

    for (const item of cart.items) {
      const ok = await this.productsService.decrementStock(item.productId, item.quantity);
      if (!ok) {
        throw new BadRequestException(
          `Insufficient stock for "${item.name}". Please update your cart.`,
        );
      }
      snapshotItems.push({
        productId: item.productId,
        name: item.name,          // snapshot at order time
        priceAtOrder: item.price, // snapshot at order time (cents)
        quantity: item.quantity,
      });
    }

    // 3. Compute totals server-side from snapshotted prices — never trust client
    const subtotal = snapshotItems.reduce(
      (sum, i) => sum + i.priceAtOrder * i.quantity,
      0,
    );
    const total = subtotal; // no tax / shipping in demo

    // 4. Persist order
    const order = await this.orderModel.create({
      userId,
      items: snapshotItems,
      subtotal,
      total,
      status: 'pending',
      paymentRef,
      shippingAddress,
    });

    // 5. Clear the cart
    await this.cartService.clearCart(userId);

    return order;
  }

  async findUserOrders(userId: string) {
    return this.orderModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .lean();
  }

  async findOneUserOrder(id: string, userId: string): Promise<OrderDocument> {
    if (!isValidObjectId(id)) throw new NotFoundException('Order not found');
    const order = await this.orderModel.findById(id);
    if (!order) throw new NotFoundException('Order not found');
    if (!order.userId || order.userId.toString() !== userId) throw new ForbiddenException('Access denied');
    return order;
  }

  async createGuestOrder(
    items: GuestCheckoutItemDto[],
    shippingAddress: ShippingAddressDto,
    guestContact: GuestContactDto,
    paymentRef: string,
  ): Promise<OrderDocument> {
    if (!items.length) throw new BadRequestException('Cart is empty');

    const snapshotItems: {
      productId: string;
      name: string;
      priceAtOrder: number;
      quantity: number;
    }[] = [];

    for (const item of items) {
      const product = await this.productsService.findOne(item.productId);
      const ok = await this.productsService.decrementStock(item.productId, item.quantity);
      if (!ok) {
        throw new BadRequestException(
          `Insufficient stock for "${product.name}". Please update your cart.`,
        );
      }
      snapshotItems.push({
        productId: item.productId,
        name: product.name,
        priceAtOrder: product.price,
        quantity: item.quantity,
      });
    }

    const subtotal = snapshotItems.reduce(
      (sum, i) => sum + i.priceAtOrder * i.quantity,
      0,
    );

    return this.orderModel.create({
      userId: null,
      items: snapshotItems,
      subtotal,
      total: subtotal,
      status: 'pending',
      paymentRef,
      shippingAddress,
      guestContact,
    });
  }

  async findAllOrders(query: AdminOrdersQueryDto) {
    const { status, page = 1, limit = 20 } = query;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const [items, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('userId', 'name email')
        .lean(),
      this.orderModel.countDocuments(filter),
    ]);

    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  async updateStatus(id: string, dto: UpdateStatusDto): Promise<OrderDocument> {
    if (!isValidObjectId(id)) throw new NotFoundException('Order not found');
    const order = await this.orderModel.findByIdAndUpdate(
      id,
      { $set: { status: dto.status } },
      { new: true },
    );
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async getDashboardStats() {
    const [revenueAgg, statusAgg, topProductsAgg] = await Promise.all([
      this.orderModel.aggregate<{ totalRevenue: number }>([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
      ]),
      this.orderModel.aggregate<{ _id: string; count: number }>([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.orderModel.aggregate<{ _id: string; totalSold: number }>([
        { $match: { status: { $ne: 'cancelled' } } },
        { $unwind: '$items' },
        { $group: { _id: '$items.name', totalSold: { $sum: '$items.quantity' } } },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const orderCountByStatus: Record<string, number> = {};
    for (const s of statusAgg) {
      orderCountByStatus[s._id] = s.count;
    }

    return {
      totalRevenue: revenueAgg[0]?.totalRevenue ?? 0,
      totalOrders: Object.values(orderCountByStatus).reduce((a, b) => a + b, 0),
      orderCountByStatus,
      topProducts: topProductsAgg,
    };
  }
}
