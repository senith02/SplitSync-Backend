# Error Handling

## Strategy

- Controllers use `asyncHandler` to forward rejected promises
- `notFound` middleware handles unknown routes
- `errorHandler` returns consistent error JSON

## HTTP Status Usage

- `200` Success read
- `201` Resource created
- `400` Validation/input error
- `401` Unauthorized token/auth failure
- `403` Forbidden (not group member)
- `404` Resource not found
- `409` Conflict (e.g., duplicate email/member)
- `500` Internal server error

## Validation

- Route-level request validation via `express-validator`
- Validation failures return `message + errors[]`

## Debugging

- Stack traces are shown only when `NODE_ENV !== production`
- Production responses suppress stack for safety
