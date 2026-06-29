import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { Order, OrderDocument } from '../orders/schemas/order.schema';

@Injectable()
export class RecommendationsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) {}

  async getRecommendations(
    userId?: string,
    excludeProductId?: string,
  ): Promise<ProductDocument[]> {
    const excludeIds: Types.ObjectId[] = [];
    if (excludeProductId && isValidObjectId(excludeProductId)) {
      excludeIds.push(new Types.ObjectId(excludeProductId));
    }

    if (userId) {
      const orders = await this.orderModel.find({ userId }).lean();

      if (orders.length > 0) {
        // Collect all purchased productIds (for exclusion + category lookup)
        const boughtIds = [
          ...new Set(orders.flatMap((o) => o.items.map((i) => i.productId.toString()))),
        ];
        const boughtObjectIds = boughtIds.map((id) => new Types.ObjectId(id));

        // Look up categories from still-existing purchased products
        const categories = await this.productModel
          .find({ _id: { $in: boughtObjectIds } })
          .distinct('category');

        if (categories.length > 0) {
          // Exclude everything bought + the current product
          const allExclude = [...boughtObjectIds, ...excludeIds];

          return this.productModel
            .find({
              category: { $in: categories },
              _id: { $nin: allExclude },
            })
            .sort({ createdAt: -1 })
            .limit(8)
            .lean();
        }
      }
    }

    // Fallback: 8 newest products (excluding current product)
    const filter = excludeIds.length ? { _id: { $nin: excludeIds } } : {};
    return this.productModel.find(filter).sort({ createdAt: -1 }).limit(8).lean();
  }
}
