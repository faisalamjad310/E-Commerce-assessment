# /debug-fix

Systematic workflow for diagnosing and fixing bugs in CartVerse.

## Steps

### 1. Understand
- What is the expected behavior?
- What is the actual behavior?
- Under what conditions does it occur? (always / specific input / specific user role / specific order of operations)

### 2. Locate
Search for the relevant code:
- Start from the error message or symptom
- Trace the path: browser console → network tab → API endpoint → NestJS controller → service → Mongoose query
- Common locations for CartVerse bugs:
  - Money/price issues → `orders.service.ts`, `cart.service.ts`, `payments.service.ts`
  - Auth/access issues → `auth.guard.ts`, `roles.guard.ts`, JWT strategy
  - Cart state issues → `frontend/src/lib/cart.tsx`
  - Form validation → `*.dto.ts` (server) or Zod schema (client)

### 3. Reproduce
- Identify the minimal input that triggers the bug
- Check backend logs for the actual exception / stack trace
- Check browser network tab for the exact HTTP request and response

### 4. Identify Root Cause
Common CartVerse bug patterns:
- Float money arithmetic (should be integer cents)
- Missing `await` on an async call
- Race condition on stock (missing `$gte` guard)
- Stale TanStack Query cache (wrong or incomplete query key)
- JWT `sub` vs `id` mismatch in ownership check
- ObjectId not validated before query (CastError)
- Missing `dark:` class breaking dark mode

### 5. Fix
- Fix the root cause, not the symptom
- Make the minimal change — don't refactor surrounding code during a bug fix
- If the fix touches money, stock, or auth — extra careful review

### 6. Verify
- Run the relevant test suite: `cd backend && npm test` or `cd frontend && npm test`
- If no test covers this bug, write one before closing
- For frontend bugs: manually verify in the browser (both light and dark mode)

### 7. Wrap Up
- Summarize what the bug was, where it was, and what the fix does
- Suggest commit: `fix: <description of what was wrong and what was fixed>`
