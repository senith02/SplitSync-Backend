# Authentication & Security

## JWT Authentication

- Token generated on register/login
- Signed with `JWT_SECRET`
- Expiry controlled by `JWT_EXPIRES_IN`

## Password Security

- Passwords are hashed with bcrypt (`saltRounds=10`)
- Hashing happens before save in User model hook

## Protected Routes

- `authMiddleware` checks `Authorization: Bearer <token>`
- Invalid or missing token returns `401`

## Security Middleware

- `helmet` for secure HTTP headers
- `cors` for cross-origin support
- `express-rate-limit` to reduce API abuse

## Environment Security

- Never commit secrets
- Keep secrets only in `.env`
- Use `.env.example` as non-secret template

## Production Recommendations

- Rotate JWT secret periodically
- Restrict CORS to allowed iOS app domains (if backend web clients exist)
- Add centralized logging (e.g., Render logs + external log provider)
- Configure Atlas IP access list correctly
