# /ship

Stage, commit, and optionally push current changes with a well-formed conventional commit message.

## Steps

1. **Audit the diff**
   - Run `git status` and `git diff` to see all changes
   - Flag anything that should NOT be committed:
     - `.env` files
     - `node_modules/`, `dist/`, `coverage/`
     - Console logs left in code
     - Debug-only changes (e.g. hardcoded test data)
   - If anything is suspicious, ask the user before continuing

2. **Draft the commit message**
   Choose the correct prefix based on what changed:
   - `feat:` — new user-visible feature
   - `fix:` — bug fix
   - `test:` — adding or fixing tests
   - `docs:` — documentation only
   - `chore:` — build config, dependencies, tooling
   - `refactor:` — code restructure without behavior change

   Format: `<type>: <what changed and why in one sentence>`

   Good examples:
   - `feat: add pagination to admin orders page`
   - `fix: prevent negative stock when concurrent orders race`
   - `test: add unit tests for guest cart add/remove logic`

3. **Stage specific files**
   ```bash
   git add backend/src/orders/orders.service.ts backend/src/orders/orders.service.spec.ts
   ```
   Never use `git add -A` or `git add .` blindly — it can pick up `.env` or binaries.

4. **Commit**
   ```bash
   git commit -m "feat: add pagination to admin orders page"
   ```

5. **Push (ask first)**
   Confirm the target branch before pushing:
   - Never push directly to `main` without asking
   - Confirm: "Push to `origin/<branch>`?"

## Rules
- Never commit `.env`, `backend/.env`, or `frontend/.env`
- Never use `--no-verify`
- Never amend published commits
- Suggest creating a PR if the branch has been pushed before
