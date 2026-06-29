# /create-module [name]

Scaffold a complete NestJS module for CartVerse following all project conventions.

## Arguments
- `name` — domain name in kebab-case (e.g. `reviews`, `wishlist`, `notifications`)

## Files to Create
```
backend/src/<name>/
  schemas/
    <singular>.schema.ts
  dto/
    create-<singular>.dto.ts
    update-<singular>.dto.ts
  <name>.service.ts
  <name>.controller.ts
  <name>.module.ts
  <name>.service.spec.ts
```

## Step-by-Step

### 1. Schema (`schemas/<singular>.schema.ts`)
```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;   // integer 1-5, NOT a float

  @Prop({ required: true })
  comment: string;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
```

Rules:
- Always `{ timestamps: true }`
- Money fields: `min: 0`, comment: "integer cents"
- References: `Types.ObjectId` with `ref`

### 2. Create DTO (`dto/create-<singular>.dto.ts`)
```typescript
import { IsMongoId, IsInt, Min, Max, IsString, IsNotEmpty } from 'class-validator';

export class CreateReviewDto {
  @IsMongoId()
  productId: string;

  @IsInt() @Min(1) @Max(5)
  rating: number;

  @IsString() @IsNotEmpty()
  comment: string;
}
```

### 3. Update DTO (`dto/update-<singular>.dto.ts`)
```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateReviewDto } from './create-review.dto';
export class UpdateReviewDto extends PartialType(CreateReviewDto) {}
```

### 4. Service (`<name>.service.ts`)
- Validate ObjectId before every query
- Throw NestJS exceptions, never return null
- Use `.lean()` for read-only queries
- Apply atomic operators for stock/counters

### 5. Controller (`<name>.controller.ts`)
- No business logic
- Apply `@UseGuards(JwtAuthGuard)` at class level for protected modules
- Apply `RolesGuard + @Roles('admin')` on admin-only endpoints

### 6. Module (`<name>.module.ts`)
```typescript
@Module({
  imports: [MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }])],
  providers: [ReviewsService],
  controllers: [ReviewsController],
  exports: [ReviewsService],
})
export class ReviewsModule {}
```

### 7. Register in AppModule
Add `ReviewsModule` to the `imports` array in `backend/src/app.module.ts`.

### 8. Write Unit Tests (`<name>.service.spec.ts`)
Cover at minimum:
- Happy path (returns expected data)
- Resource not found (NotFoundException)
- Invalid ObjectId (NotFoundException)
- Authorization check if applicable (ForbiddenException)

## Checklist
- [ ] Schema has `timestamps: true`
- [ ] Money fields use integer constraints (`@IsInt`, `min: 0`)
- [ ] ObjectId validated before every `.findById()` or `.findOne()`
- [ ] Admin-only routes have both `JwtAuthGuard` + `RolesGuard`
- [ ] Module added to AppModule imports
- [ ] Unit tests written and passing (`npm test`)
