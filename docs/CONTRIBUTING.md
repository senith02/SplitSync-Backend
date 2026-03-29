# Contributing Guide

## Branch Naming

Use clear prefixes:

- `feature/<name>`
- `fix/<name>`
- `chore/<name>`

## Code Conventions

- Use `async/await`
- Keep controllers thin and readable
- Validate all request inputs in routes
- Return consistent JSON response shape

## Adding a New Endpoint

1. Add validation + route in `routes/*Routes.js`
2. Implement controller logic in `controllers/*Controller.js`
3. Add/extend model if needed
4. Reuse middleware/utils where possible
5. Update docs in `docs/API_REFERENCE.md`

## Pull Request Checklist

- [ ] Endpoint implemented and tested manually
- [ ] Validation and auth checks present
- [ ] Error cases handled with proper status codes
- [ ] Docs updated

## Future Enhancements Backlog

- Unit and integration tests (Jest + Supertest)
- OpenAPI/Swagger documentation
- Role-based permissions in groups
- Settlement-aware live balances
