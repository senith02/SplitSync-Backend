# Architecture

## Style

- REST API
- MVC-like structure
- Modular folders by responsibility

## Folder Layout

- `config/` → database and environment validation
- `models/` → Mongoose schemas
- `controllers/` → request handling and business coordination
- `routes/` → route declarations + request validators
- `middleware/` → auth, request validation, error middleware
- `utils/` → reusable helpers (token, async wrapper, balance calculator)

## Request Flow

1. Route receives request
2. Validation middleware checks input
3. Auth middleware validates JWT (protected routes)
4. Controller executes logic and model operations
5. Response is sent with consistent JSON shape
6. Errors bubble to global error middleware

## Runtime Files

- `app.js` configures middleware and routes
- `server.js` loads env, validates env, connects DB, starts HTTP server

## Design Decisions

- Use `async/await` everywhere for readability and controlled error propagation
- Centralized `asyncHandler` to reduce repetitive try/catch
- JWT auth for stateless API access from iOS client
- Mongoose `timestamps: true` for audit-friendly entities
