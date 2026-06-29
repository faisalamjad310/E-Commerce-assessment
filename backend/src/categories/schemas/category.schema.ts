import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: { createdAt: 'createdAt', updatedAt: false } })
export class Category {
  @Prop({ required: true, trim: true, unique: true })
  name: string;

  @Prop({ trim: true, default: '' })
  description: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ trim: true, index: true })
  slug: string;

  createdAt: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
