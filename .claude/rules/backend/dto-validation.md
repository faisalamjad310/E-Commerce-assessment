# DTO Validation — CartVerse

## File Location & Naming
```
backend/src/<domain>/dto/
  create-<singular>.dto.ts    # POST body
  update-<singular>.dto.ts    # PATCH body (extends PartialType)
  query-<plural>.dto.ts       # GET query params (pagination + filters)
```

## Standard Create DTO
```typescript
import {
  IsString, IsNotEmpty, IsInt, IsOptional, Min, IsUrl,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @Min(1)
  price: number;          // integer cents — enforce with @IsInt(), not @IsNumber()

  @IsInt()
  @Min(0)
  stock: number;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}
```

## Update DTO — Use PartialType
```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
```

## Pagination Query DTO
```typescript
import { IsOptional, IsInt, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryProductsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 12;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
```

`@Type(() => Number)` is required for query params because they always arrive as strings — the `transform: true` pipe converts them.

## MongoId Param Validation
```typescript
import { IsMongoId } from 'class-validator';

export class MongoIdParam {
  @IsMongoId()
  id: string;
}

// In controller:
@Get(':id')
findOne(@Param() { id }: MongoIdParam) { ... }
```

## Global Pipe (already set in main.ts — do not change)
```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,               // strips unknown fields
  forbidNonWhitelisted: true,    // 400 if unknown fields sent
  transform: true,               // auto-converts types
  transformOptions: { enableImplicitConversion: true },
}));
```

## Rules
- Use `@IsInt()` not `@IsNumber()` for price/stock/quantity — integers only
- Use `@Min(1)` for prices, `@Min(0)` for stock and quantities
- Never accept `total`, `subtotal`, or any computed money value from the client
- Use `@IsOptional()` only for genuinely optional fields — don't use it to skip validation
- Add `@Type(() => Number)` to every numeric query param DTO field
