import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CartService } from './cart.service';
import { Cart } from './schemas/cart.schema';
import { ProductsService } from '../products/products.service';

const userId    = 'user-abc';
const productId = new Types.ObjectId().toHexString();

function makeProduct(stock: number) {
  return { _id: productId, name: 'Widget', price: 999, imageUrl: 'img.jpg', stock };
}

// Builds a mock cart document with a fake `items` array
function makeCartDoc(items: { productId: Types.ObjectId; quantity: number }[]) {
  return { _id: 'cart1', userId, items };
}

// Returns a lean-capable mock for getCart's .populate().lean() chain
function populateLeanMock(leanResult: unknown) {
  return {
    populate: jest.fn().mockReturnThis(),
    lean:     jest.fn().mockResolvedValue(leanResult),
  };
}

describe('CartService', () => {
  let service: CartService;

  const mockCartModel = {
    findOneAndUpdate: jest.fn(),
    findOne:          jest.fn(),
    updateOne:        jest.fn(),
  };

  const mockProductsService = { findOne: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getModelToken(Cart.name), useValue: mockCartModel     },
        { provide: ProductsService,           useValue: mockProductsService },
      ],
    }).compile();

    service = module.get(CartService);
  });

  afterEach(() => jest.clearAllMocks());

  // ── addItem ───────────────────────────────────────────────────────────────────

  describe('addItem', () => {
    beforeEach(() => {
      // ensureCart upsert
      mockCartModel.findOneAndUpdate.mockResolvedValue(makeCartDoc([]));
      mockCartModel.updateOne.mockResolvedValue({});
    });

    it('uses $push when the product is not yet in the cart', async () => {
      mockProductsService.findOne.mockResolvedValue(makeProduct(10));
      mockCartModel.findOne
        .mockResolvedValueOnce(makeCartDoc([]))                    // addItem stock-check
        .mockReturnValueOnce(populateLeanMock({ items: [] }));     // getCart

      await service.addItem(userId, { productId, quantity: 2 });

      const pushCall = mockCartModel.updateOne.mock.calls[0][1];
      expect(pushCall).toMatchObject({ $push: { items: { productId, quantity: 2 } } });
    });

    it('uses $set to increment quantity for an existing item', async () => {
      mockProductsService.findOne.mockResolvedValue(makeProduct(10));
      const existing = makeCartDoc([{ productId: new Types.ObjectId(productId), quantity: 3 }]);
      mockCartModel.findOne
        .mockResolvedValueOnce(existing)                           // addItem stock-check
        .mockReturnValueOnce(populateLeanMock({ items: [] }));     // getCart

      await service.addItem(userId, { productId, quantity: 2 }); // 3 + 2 = 5

      const setCall = mockCartModel.updateOne.mock.calls[0][1];
      expect(setCall).toMatchObject({ $set: { 'items.$.quantity': 5 } });
    });

    it('throws BadRequestException when new quantity would exceed stock', async () => {
      mockProductsService.findOne.mockResolvedValue(makeProduct(3));
      mockCartModel.findOne.mockResolvedValueOnce(makeCartDoc([]));

      await expect(
        service.addItem(userId, { productId, quantity: 5 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when existing + new quantity exceeds stock', async () => {
      mockProductsService.findOne.mockResolvedValue(makeProduct(4));
      const existing = makeCartDoc([{ productId: new Types.ObjectId(productId), quantity: 3 }]);
      mockCartModel.findOne.mockResolvedValueOnce(existing);

      await expect(
        service.addItem(userId, { productId, quantity: 2 }), // 3 + 2 = 5 > stock(4)
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── removeItem ────────────────────────────────────────────────────────────────

  describe('removeItem', () => {
    it('calls $pull with the product ObjectId', async () => {
      mockCartModel.updateOne.mockResolvedValue({});
      mockCartModel.findOne.mockReturnValue(populateLeanMock({ items: [] }));

      await service.removeItem(userId, productId);

      const pullArg = mockCartModel.updateOne.mock.calls[0][1];
      expect(pullArg).toMatchObject({
        $pull: { items: { productId: expect.any(Types.ObjectId) } },
      });
    });
  });

  // ── clearCart ─────────────────────────────────────────────────────────────────

  describe('clearCart', () => {
    it('sets items to an empty array', async () => {
      mockCartModel.updateOne.mockResolvedValue({});

      await service.clearCart(userId);

      const setArg = mockCartModel.updateOne.mock.calls[0][1];
      expect(setArg).toEqual({ $set: { items: [] } });
    });
  });
});
