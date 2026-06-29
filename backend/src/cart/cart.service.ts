import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { ProductsService } from '../products/products.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

interface PopulatedProduct {
  _id: Types.ObjectId;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
}

export interface CartResponseItem {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  lineTotal: number;
}

export interface CartResponse {
  items: CartResponseItem[];
  orderTotal: number;
}

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    private productsService: ProductsService,
  ) {}

  private async ensureCart(userId: string): Promise<CartDocument> {
    return this.cartModel.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId, items: [] } },
      { upsert: true, new: true },
    );
  }

  async getCart(userId: string): Promise<CartResponse> {
    const cart = await this.cartModel
      .findOne({ userId })
      .populate('items.productId', 'name price imageUrl stock')
      .lean();

    if (!cart || cart.items.length === 0) {
      return { items: [], orderTotal: 0 };
    }

    const items: CartResponseItem[] = (cart.items as unknown as { productId: PopulatedProduct; quantity: number }[])
      .filter(item => item.productId != null)
      .map(item => {
        const p = item.productId;
        return {
          productId: p._id.toString(),
          name: p.name,
          price: p.price,
          imageUrl: p.imageUrl,
          quantity: item.quantity,
          lineTotal: p.price * item.quantity,
        };
      });

    const orderTotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
    return { items, orderTotal };
  }

  async addItem(userId: string, dto: AddItemDto): Promise<CartResponse> {
    if (!isValidObjectId(dto.productId)) {
      throw new BadRequestException('Invalid product ID');
    }

    const product = await this.productsService.findOne(dto.productId);
    await this.ensureCart(userId);

    const cart = await this.cartModel.findOne({ userId });
    const existing = cart!.items.find(i => i.productId.toString() === dto.productId);
    const newQty = (existing?.quantity ?? 0) + dto.quantity;

    if (newQty > product.stock) {
      throw new BadRequestException(`Only ${product.stock} unit(s) available`);
    }

    if (existing) {
      await this.cartModel.updateOne(
        { userId, 'items.productId': dto.productId },
        { $set: { 'items.$.quantity': newQty } },
      );
    } else {
      await this.cartModel.updateOne(
        { userId },
        { $push: { items: { productId: dto.productId, quantity: dto.quantity } } },
      );
    }

    return this.getCart(userId);
  }

  async updateItem(userId: string, productId: string, dto: UpdateItemDto): Promise<CartResponse> {
    if (!isValidObjectId(productId)) {
      throw new BadRequestException('Invalid product ID');
    }

    if (dto.quantity === 0) {
      return this.removeItem(userId, productId);
    }

    const product = await this.productsService.findOne(productId);
    if (dto.quantity > product.stock) {
      throw new BadRequestException(`Only ${product.stock} unit(s) available`);
    }

    await this.cartModel.updateOne(
      { userId, 'items.productId': productId },
      { $set: { 'items.$.quantity': dto.quantity } },
    );

    return this.getCart(userId);
  }

  async removeItem(userId: string, productId: string): Promise<CartResponse> {
    if (!isValidObjectId(productId)) {
      throw new BadRequestException('Invalid product ID');
    }

    await this.cartModel.updateOne(
      { userId },
      { $pull: { items: { productId: new Types.ObjectId(productId) } } },
    );

    return this.getCart(userId);
  }

  async clearCart(userId: string): Promise<void> {
    await this.cartModel.updateOne({ userId }, { $set: { items: [] } });
  }
}
