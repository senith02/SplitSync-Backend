# Getting Started

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB Atlas cluster

## Installation

```bash
pnpm install
```

## Environment Configuration

This project uses two env files by design:

- `.env.example` → template file committed to repo (no secrets)
- `.env` → your real local values (ignored by git)

### Steps

1. Copy `.env.example` to `.env`
2. Replace placeholders with real values

Required keys:

- `MONGO_URI`
- `JWT_SECRET`

## Run

Development mode:

```bash
pnpm run dev
```

Production mode:

```bash
pnpm start
```

## Health Check

- `GET /api/health`

Expected response:

```json
{
  "success": true,
  "message": "SplitSync API is running"
}
```

## Common Startup Error

If you see:

`MONGO_URI contains placeholder values...`

Your `.env` still has template values like `<cluster-url>`.
Replace `MONGO_URI` with your real Atlas connection string.
