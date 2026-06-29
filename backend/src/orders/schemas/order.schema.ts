import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ _id: false })
class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, min: 0 })
  priceAtOrder: number; // cents — snapshot at order time

  @Prop({ required: true, min: 1 })
  quantity: number;
}
const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ _id: false })
class ShippingAddress {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  city: string;
}
const ShippingAddressSchema = SchemaFactory.createForClass(ShippingAddress);

@Schema({ _id: false })
class GuestContact {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  phone: string;
}
const GuestContactSchema = SchemaFactory.createForClass(GuestContact);

@Schema({ timestamps: { createdAt: 'createdAt', updatedAt: false } })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: false, default: null, index: true })
  userId: Types.ObjectId | null;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @Prop({ required: true, min: 0 })
  subtotal: number; // cents

  @Prop({ required: true, min: 0 })
  total: number; // cents

  @Prop({
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
    index: true,
  })
  status: string;

  @Prop({ required: true })
  paymentRef: string;

  @Prop({ type: ShippingAddressSchema, required: true })
  shippingAddress: ShippingAddress;

  @Prop({ type: GuestContactSchema, required: false, default: null })
  guestContact: GuestContact | null;

  createdAt: Date;
}

export type OrderDocument = HydratedDocument<Order>;
export const OrderSchema = SchemaFactory.createForClass(Order);
