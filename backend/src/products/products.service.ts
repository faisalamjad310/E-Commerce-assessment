import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CatalogQueryDto } from './dto/catalog-query.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async findAll(query: CatalogQueryDto) {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sortBy = 'newest',
      page = 1,
      limit = 12,
    } = query;

    const filter: Record<string, unknown> = {};

    if (search) {
      // Escape regex special characters to prevent ReDoS
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.name = { $regex: escaped, $options: 'i' };
    }

    if (category) {
      filter.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) (filter.price as Record<string, number>).$gte = minPrice;
      if (maxPrice !== undefined) (filter.price as Record<string, number>).$lte = maxPrice;
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      newest: { createdAt: -1 },
    };
    const sort = sortMap[sortBy] ?? sortMap.newest;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.productModel.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      this.productModel.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<ProductDocument> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`Product not found`);
    }
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException(`Product not found`);
    }
    return product;
  }

  async findCategories(): Promise<string[]> {
    const categories = await this.productModel.distinct('category');
    return (categories as string[]).sort();
  }

  async create(dto: CreateProductDto): Promise<ProductDocument> {
    return this.productModel.create(dto);
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductDocument> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`Product not found`);
    }
    const updated = await this.productModel.findByIdAndUpdate(id, dto, { new: true });
    if (!updated) {
      throw new NotFoundException(`Product not found`);
    }
    return updated;
  }

  /** Atomically decrements stock. Returns false if stock < quantity (no negative stock). */
  async decrementStock(productId: string, quantity: number): Promise<boolean> {
    const result = await this.productModel.findOneAndUpdate(
      { _id: new Types.ObjectId(productId), stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
    );
    return result !== null;
  }

  async remove(id: string): Promise<void> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`Product not found`);
    }
    const result = await this.productModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Product not found`);
    }
  }
}
