# Testing Rules

## Philosophy
- Write tests that give confidence, not tests that hit coverage numbers
- Test behavior, not implementation details
- If it can break in production, it should have a test

## Test Pyramid
1. **Unit tests** (most) — pure functions, services, utilities
2. **Integration tests** (some) — API routes, component rendering
3. **E2E tests** (few) — critical user flows

## Conventions
- Test files live next to source: `user.service.ts` -> `user.service.test.ts`
- Use `describe` blocks to group related tests
- Test names should read like sentences: `it('returns 404 when user not found')`
- One assertion per test when possible — keeps failures clear
- Use `beforeEach` for setup, not `beforeAll` (avoid shared mutable state)

## What to Test
- Happy path for every feature
- Edge cases and error states
- Input validation (invalid, missing, boundary values)
- Auth-protected routes (with and without valid auth)
- API response shapes match expected types

## What NOT to Test
- Third-party library internals
- Exact CSS / styling (use visual regression if needed)
- Implementation details (private methods, internal state)
