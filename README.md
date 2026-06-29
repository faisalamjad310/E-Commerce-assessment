# CartVerse

A mini e-commerce platform with a customer storefront and admin panel sharing one backend API.

## Prerequisites

- Node.js >= 20
- MongoDB running locally (default: `mongodb://localhost:27017`) or a MongoDB Atlas URI

## Environment Setup

```bash
# Backend
cp backend/.env.example backend/.env
# Open backend/.env and set JWT_SECRET to a strong random string.
# MONGO_URI defaults to local; update it if you're using Atlas.

# Frontend
cp frontend/.env.example frontend/.env
# VITE_API_URL defaults to http://localhost:3000/api — no change needed for local dev.
```

## Running the App

**Backend** (port 3000):
```bash
cd backend && npm run start:dev
```

**Frontend** (port 5173):
```bash
cd frontend && npm run dev
```

**Seed the database:**
```bash
cd backend && npm run seed
```

## API Docs (Swagger)

Once the backend is running, open:

```
http://localhost:3000/api/docs
```

## Seeded Credentials

| Role     | Email                  | Password   |
|----------|------------------------|------------|
| Admin    | admin@cartverse.dev    | Admin123!  |
| Customer | customer@cartverse.dev | Customer1! |

## Running Tests

```bash
cd backend && npm test
```
