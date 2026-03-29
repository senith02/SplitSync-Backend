# Deployment Guide

## Render / Railway

### 1. Create service

- Connect GitHub repository
- Choose Node runtime

### 2. Configure commands

- Build command: `pnpm install --frozen-lockfile`
- Start command: `pnpm start`

### 3. Add environment variables

- `NODE_ENV=production`
- `PORT=5000` (or platform-provided)
- `MONGO_URI=<your atlas uri>`
- `JWT_SECRET=<strong secret>`
- `JWT_EXPIRES_IN=7d`

### 4. MongoDB Atlas checklist

- Database user has read/write permissions
- IP access list allows deployment traffic
- Connection string is URL-encoded for special password chars

### 5. Verify deployment

- Hit `/api/health`
- Register user and login
- Create group and add expense

## Recommended Next Steps

- Add structured logger (pino/winston)
- Add monitoring and alerting
- Add automated tests in CI pipeline
