# Code Style — CartVerse

## File Naming

| Kind | Convention | Example |
|---|---|---|
| NestJS schema | `kebab-case.schema.ts` | `product.schema.ts` |
| NestJS DTO | `verb-noun.dto.ts` | `create-product.dto.ts` |
| NestJS service | `noun.service.ts` | `products.service.ts` |
| NestJS controller | `noun.controller.ts` | `products.controller.ts` |
| NestJS module | `noun.module.ts` | `products.module.ts` |
| NestJS guard | `name.guard.ts` | `roles.guard.ts` |
| React page | `PascalCasePage.tsx` | `ProductDetailPage.tsx` |
| React component | `PascalCase.tsx` | `ProductCard.tsx` |
| React hook | `useNoun.ts` | `useIntersectionObserver.ts` |
| API helper | `noun.ts` | `products.ts` |

## Naming Conventions

- **Classes / React components**: `PascalCase`
- **Functions / variables**: `camelCase`
- **Module-level constants**: `UPPER_SNAKE_CASE`
- **Mongoose schemas**: suffix `Schema` → `ProductSchema`
- **Mongoose document types**: suffix `Document` → `ProductDocument`
- **DTOs**: suffix `Dto` → `CreateProductDto`
- **NestJS modules**: suffix `Module` → `ProductsModule`

## Import Order

### Backend
1. NestJS core (`@nestjs/*`)
2. Third-party (`mongoose`, `bcrypt`, `stripe`, etc.)
3. Internal — other modules (`../users/users.service`)
4. Local — same module (`./schemas/product.schema`, `./dto/create-product.dto`)

### Frontend
1. React / framework (`react`, `react-router-dom`)
2. Third-party (`@tanstack/react-query`, `axios`, `zod`, `lucide-react`)
3. Internal lib (`../../lib/auth`, `../../lib/cart`)
4. Internal api (`../../api/products`)
5. Internal components (`../../components/`)
6. Local (`./ProductCard`)

## TypeScript Strictness
- No `any` without a comment explaining why
- Use `unknown` for caught errors: `catch (err: unknown)`
- Prefer `interface` for object shapes, `type` for unions/aliases
- Use `import type` for type-only imports (`import type { Product } from './schemas/product.schema'`)
- `as const` for fixed string arrays (e.g. status lists)

## NestJS Structure Rules
- Controllers handle HTTP only — no business logic, no database calls
- Services contain all business logic and throw NestJS exceptions
- Schemas in `schemas/` subdirectory, DTOs in `dto/` subdirectory
- One concern per module; export service only if another module needs it

## React Structure Rules
- Functional components only — no class components
- One component per file
- Props interface defined above the component: `interface Props { ... }`
- Hooks at the top of the component body, before derived values and handlers

## Comments
- Write comments only for non-obvious WHY — never for WHAT the code does
- No commented-out code in commits
- No `TODO` / `FIXME` without a linked issue
