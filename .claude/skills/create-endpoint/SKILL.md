# /create-endpoint

Add a new HTTP endpoint to an existing CartVerse module.

## Before Starting
Identify:
- Which module does this belong to? (products, cart, orders, payments, admin…)
- What HTTP method? (GET / POST / PATCH / DELETE)
- Who can call it? (public / authenticated customer / admin only)
- What does it accept? (body DTO / query params / route params)
- What does it return?

## Step-by-Step

### 1. Define the DTO (if the input is new)
```typescript
// dto/cancel-order.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class CancelOrderDto {
  @IsString()
  @IsOptional()
  reason?: string;
}
```

If the input shape already exists, reuse the existing DTO.

### 2. Implement the Service Method
```typescript
async cancelOrder(orderId: string, userId: string, dto: CancelOrderDto): Promise<Order> {
  if (!Types.ObjectId.isValid(orderId)) throw new NotFoundException('Invalid order ID');

  const order = await this.model.findById(orderId).lean();
  if (!order) throw new NotFoundException(`Order ${orderId} not found`);
  if (order.userId.toString() !== userId) throw new ForbiddenException('Access denied');
  if (order.status === 'delivered') throw new BadRequestException('Cannot cancel a delivered order');

  return this.model.findByIdAndUpdate(orderId, { $set: { status: 'cancelled' } }, { new: true }).lean();
}
```

### 3. Add the Controller Method
```typescript
// Guard reference:
// Public:            no guard
// Customer:          @UseGuards(JwtAuthGuard)
// Admin only:        @UseGuards(JwtAuthGuard, RolesGuard) + @Roles('admin')

@Patch(':id/cancel')
@UseGuards(JwtAuthGuard)
cancelOrder(
  @Param('id') id: string,
  @Body() dto: CancelOrderDto,
  @Request() req: { user: JwtPayload },
) {
  return this.ordersService.cancelOrder(id, req.user.sub, dto);
}
```

### 4. Write a Unit Test
Add a new `describe` block in the service's `.spec.ts`:
```typescript
describe('cancelOrder', () => {
  it('throws NotFoundException for a malformed order ID', async () => {
    await expect(service.cancelOrder('bad-id', userId, {})).rejects.toThrow(NotFoundException);
  });

  it('throws ForbiddenException when order belongs to another user', async () => {
    mockModel.findById.mockResolvedValue({ userId: new Types.ObjectId() });
    await expect(service.cancelOrder(orderId, differentUserId, {})).rejects.toThrow(ForbiddenException);
  });

  it('throws BadRequestException when order is already delivered', async () => {
    mockModel.findById.mockResolvedValue({ userId: new Types.ObjectId(userId), status: 'delivered' });
    await expect(service.cancelOrder(orderId, userId, {})).rejects.toThrow(BadRequestException);
  });
});
```

## Checklist
- [ ] DTO validates all input fields with class-validator
- [ ] Service validates ObjectId before querying
- [ ] Service throws correct exception type for each failure mode
- [ ] Correct guard applied (JwtAuthGuard / RolesGuard)
- [ ] Ownership checked if customer endpoint (`order.userId === req.user.sub`)
- [ ] Unit tests added covering happy path + key error cases
