# NestJS Patterns — CartVerse

## Module Layout
Every domain module follows this structure:
```
backend/src/<domain>/
  schemas/
    <singular>.schema.ts     # Mongoose schema + Document type
  dto/
    create-<singular>.dto.ts
    update-<singular>.dto.ts
    query-<plural>.dto.ts    # pagination + filter params (if needed)
  <plural>.service.ts
  <plural>.controller.ts
  <plural>.module.ts
  <plural>.service.spec.ts   # unit tests
```

## Controller Pattern — Thin HTTP Layer
```typescript
@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Public endpoint — no guard
  @Get()
  findAll(@Query() query: QueryProductsDto) {
    return this.productsService.findAll(query);
  }

  // Authenticated customer endpoint
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  // Admin-only write endpoint
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }
}
```

No business logic, no try/catch, no database calls in controllers.

## Service Pattern — All Business Logic Here
```typescript
@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly model: Model<ProductDocument>,
  ) {}

  async findAll(query: QueryProductsDto) {
    const { page = 1, limit = 12, category, search } = query;
    const filter: FilterQuery<ProductDocument> = {};

    if (category) filter.category = category;
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.name = { $regex: escaped, $options: 'i' };
    }

    const [items, total] = await Promise.all([
      this.model.find(filter).sort({ createdAt: -1 })
        .skip((page - 1) * limit).limit(limit).lean(),
      this.model.countDocuments(filter),
    ]);

    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new NotFoundException('Invalid ID');
    const doc = await this.model.findById(id).lean();
    if (!doc) throw new NotFoundException(`Product ${id} not found`);
    return doc;
  }
}
```

## Getting the Current User
```typescript
// JWT payload type (defined in auth/jwt.strategy.ts)
interface JwtPayload { sub: string; email: string; role: string; }

@Get('me/orders')
@UseGuards(JwtAuthGuard)
getMyOrders(@Request() req: { user: JwtPayload }) {
  return this.ordersService.findByUser(req.user.sub);
}
```

## Paginated Response Shape
All paginated endpoints return this shape — keep it consistent:
```typescript
{ items: T[], total: number, page: number, totalPages: number }
```

## Module Registration
```typescript
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
  ],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService],   // export only if other modules import this
})
export class ProductsModule {}
```

Then import in `AppModule`:
```typescript
@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI),
    ProductsModule,
    // ...
  ],
})
export class AppModule {}
```
