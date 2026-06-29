import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { OrdersService } from './orders.service';
import { Order } from './schemas/order.schema';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';

const SHIPPING = { name: 'Jane Doe', address: '42 Elm St', city: 'London' };
const userId   = new Types.ObjectId().toHexString();

function makeCartWithItems(items: { productId: string; name: string; price: number; quantity: number }[]) {
  const orderTotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  return { items, orderTotal };
}

describe('OrdersService', () => {
  let service: OrdersService;

  const mockOrderModel = {
    create:           jest.fn(),
    find:             jest.fn(),
    findById:         jest.fn(),
    findByIdAndUpdate: jest.fn(),
    countDocuments:   jest.fn(),
    aggregate:        jest.fn(),
  };

  const mockCartService = {
    getCart:   jest.fn(),
    clearCart: jest.fn().mockResolvedValue(undefined),
  };

  const mockProductsService = {
    decrementStock: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getModelToken(Order.name), useValue: mockOrderModel },
        { provide: CartService,     useValue: mockCartService     },
        { provide: ProductsService, useValue: mockProductsService },
      ],
    }).compile();

    service = module.get(OrdersService);
  });

  afterEach(() => jest.clearAllMocks());

  // ── createOrder ───────────────────────────────────────────────────────────────

  describe('createOrder', () => {
    it('throws BadRequestException when the cart is empty', async () => {
      mockCartService.getCart.mockResolvedValue({ items: [], orderTotal: 0 });

      await expect(service.createOrder(userId, SHIPPING, 'REF-001')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException when decrementStock returns false (insufficient stock)', async () => {
      mockCartService.getCart.mockResolvedValue(
        makeCartWithItems([{ productId: new Types.ObjectId().toHexString(), name: 'Widget', price: 999, quantity: 99 }]),
      );
      mockProductsService.decrementStock.mockResolvedValue(false);

      await expect(service.createOrder(userId, SHIPPING, 'REF-002')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('snapshots priceAtOrder from cart data — never trusts a client total', async () => {
      const pid    = new Types.ObjectId().toHexString();
      const price  = 4999;
      const qty    = 2;

      mockCartService.getCart.mockResolvedValue(
        makeCartWithItems([{ productId: pid, name: 'Gadget', price, quantity: qty }]),
      );
      mockProductsService.decrementStock.mockResolvedValue(true);
      mockOrderModel.create.mockImplementation(async (d) => d);

      const order = await service.createOrder(userId, SHIPPING, 'REF-003');

      expect(order.items[0].priceAtOrder).toBe(price);
      expect(order.items[0].name).toBe('Gadget');
    });

    it('computes subtotal and total server-side from snapshotted prices', async () => {
      const items = [
        { productId: new Types.ObjectId().toHexString(), name: 'A', price: 1000, quantity: 3 },
        { productId: new Types.ObjectId().toHexString(), name: 'B', price: 500,  quantity: 2 },
      ];
      const expected = 1000 * 3 + 500 * 2; // 4000

      mockCartService.getCart.mockResolvedValue(makeCartWithItems(items));
      mockProductsService.decrementStock.mockResolvedValue(true);
      mockOrderModel.create.mockImplementation(async (d) => d);

      const order = await service.createOrder(userId, SHIPPING, 'REF-004');

      expect(order.subtotal).toBe(expected);
      expect(order.total).toBe(expected);
    });

    it('clears the cart after a successful order', async () => {
      mockCartService.getCart.mockResolvedValue(
        makeCartWithItems([{ productId: new Types.ObjectId().toHexString(), name: 'X', price: 100, quantity: 1 }]),
      );
      mockProductsService.decrementStock.mockResolvedValue(true);
      mockOrderModel.create.mockImplementation(async (d) => d);

      await service.createOrder(userId, SHIPPING, 'REF-005');

      expect(mockCartService.clearCart).toHaveBeenCalledWith(userId);
    });
  });

  // ── findOneUserOrder ──────────────────────────────────────────────────────────

  describe('findOneUserOrder', () => {
    it('throws NotFoundException for a malformed order ID', async () => {
      await expect(service.findOneUserOrder('bad-id', userId)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when the order belongs to another user', async () => {
      const order = {
        _id:    new Types.ObjectId(),
        userId: new Types.ObjectId(), // different user
      };
      mockOrderModel.findById.mockResolvedValue(order);

      await expect(
        service.findOneUserOrder(order._id.toHexString(), new Types.ObjectId().toHexString()),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
