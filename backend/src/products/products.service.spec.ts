import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ProductsService } from './products.service';
import { Product } from './schemas/product.schema';

// Builds a chainable Mongoose-query mock that resolves to `data`
function queryMock(data: unknown) {
  const q = {
    sort:  jest.fn().mockReturnThis(),
    skip:  jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean:  jest.fn().mockResolvedValue(data),
    exec:  jest.fn().mockResolvedValue(data),
  };
  return q;
}

const ELECTRONICS = [
  { _id: new Types.ObjectId(), name: 'Phone',  category: 'Electronics', price: 59999, stock: 10 },
  { _id: new Types.ObjectId(), name: 'Laptop', category: 'Electronics', price: 99999, stock: 5  },
];
const CLOTHING = [
  { _id: new Types.ObjectId(), name: 'T-Shirt', category: 'Clothing', price: 1999, stock: 50 },
];

describe('ProductsService', () => {
  let service: ProductsService;

  const mockModel = {
    find:            jest.fn(),
    findById:        jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findOneAndUpdate: jest.fn(),
    countDocuments:  jest.fn(),
    distinct:        jest.fn(),
    create:          jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getModelToken(Product.name), useValue: mockModel },
      ],
    }).compile();

    service = module.get(ProductsService);
  });

  afterEach(() => jest.clearAllMocks());

  // ── findAll ───────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('passes the category filter to the model', async () => {
      mockModel.find.mockReturnValue(queryMock(ELECTRONICS));
      mockModel.countDocuments.mockResolvedValue(ELECTRONICS.length);

      const result = await service.findAll({ category: 'Electronics', page: 1, limit: 12 });

      const filter = mockModel.find.mock.calls[0][0];
      expect(filter.category).toBe('Electronics');
      expect(result.items).toHaveLength(2);
    });

    it('applies correct skip for page 3 with limit 10', async () => {
      mockModel.find.mockReturnValue(queryMock([]));
      mockModel.countDocuments.mockResolvedValue(30);

      await service.findAll({ page: 3, limit: 10 });

      const chain = mockModel.find.mock.results[0].value;
      expect(chain.skip).toHaveBeenCalledWith(20);
      expect(chain.limit).toHaveBeenCalledWith(10);
    });

    it('computes totalPages by ceiling division', async () => {
      mockModel.find.mockReturnValue(queryMock([]));
      mockModel.countDocuments.mockResolvedValue(25);

      const result = await service.findAll({ page: 1, limit: 12 });
      expect(result.totalPages).toBe(3); // ceil(25/12)
    });

    it('escapes regex special characters in search to prevent ReDoS', async () => {
      mockModel.find.mockReturnValue(queryMock([]));
      mockModel.countDocuments.mockResolvedValue(0);

      await service.findAll({ search: 'C++', page: 1, limit: 12 });

      const filter = mockModel.find.mock.calls[0][0];
      expect(filter.name.$regex).toBe('C\\+\\+');
    });
  });

  // ── findOne ───────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('throws NotFoundException for a malformed ID', async () => {
      await expect(service.findOne('not-an-object-id')).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when the product does not exist', async () => {
      mockModel.findById.mockResolvedValue(null);
      await expect(service.findOne(new Types.ObjectId().toHexString())).rejects.toThrow(NotFoundException);
    });
  });

  // ── decrementStock ────────────────────────────────────────────────────────────

  describe('decrementStock', () => {
    const id = new Types.ObjectId().toHexString();

    it('returns true when the update succeeds (sufficient stock)', async () => {
      mockModel.findOneAndUpdate.mockResolvedValue({ _id: id, stock: 8 });
      expect(await service.decrementStock(id, 2)).toBe(true);
    });

    it('returns false when the update returns null (insufficient stock)', async () => {
      mockModel.findOneAndUpdate.mockResolvedValue(null);
      expect(await service.decrementStock(id, 100)).toBe(false);
    });

    it('uses { stock: { $gte: quantity } } in the filter to prevent negative stock', async () => {
      mockModel.findOneAndUpdate.mockResolvedValue(null);
      await service.decrementStock(id, 3);

      const filterArg = mockModel.findOneAndUpdate.mock.calls[0][0];
      expect(filterArg.stock).toEqual({ $gte: 3 });
    });
  });
});
