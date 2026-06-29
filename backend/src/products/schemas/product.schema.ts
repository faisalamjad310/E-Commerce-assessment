import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: { createdAt: 'createdAt', updatedAt: false } })
export class Product {
  @Prop({ required: true, trim: true, index: 'text' })
  name: string;

  @Prop({ required: true })
  description: string;

  /** Price in integer cents (e.g. 1999 = $19.99). Never stored as float. */
  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true, trim: true, index: true })
  category: string;

  /** Integer units on hand. Never goes negative. */
  @Prop({ required: true, min: 0, default: 0 })
  stock: number;

  createdAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Compound index for catalog queries
ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ createdAt: -1 });
