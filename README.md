# SplitSync Backend

Production-ready REST API backend for the SplitSync iOS app.

## Tech Stack

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose ODM
- JWT Auth

## Project Structure

```bash
splitsync-backend/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── utils/
├── app.js
├── server.js
├── .env.example
└── package.json
```

## API Base URL

`http://localhost:5000/api`

Root health URL:

`http://localhost:5000/`

Swagger UI:

`http://localhost:5000/api/docs`

## Endpoints

### Auth
- `POST /auth/register`
- `POST /auth/login`

### Groups
- `POST /groups`
- `GET /groups`
- `GET /groups/:id`
- `POST /groups/:id/add-member`
- `GET /groups/:id/balances`

### Expenses
- `POST /expenses`
- `GET /expenses/:groupId?page=1&limit=10`

### Settlement
- `POST /settle`

### Health
- `GET /health`

## Setup & Run

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Configure environment:
   - `.env.example` is a safe template (committed)
   - `.env` is your real local config (not committed)
   - copy template and update values:
   ```bash
   copy .env.example .env
   ```
    - optional hosting variables:
       - `HOST` for bind address (usually `0.0.0.0` on VPS)
       - `PUBLIC_BASE_URL` for your domain (e.g., `https://mydomain.me`)

3. Start dev server:
   ```bash
   pnpm run dev
   ```

4. Start production server:
   ```bash
   pnpm start
   ```

## Swagger Usage

- Open Swagger at `http://localhost:5000/api/docs`
- Call `POST /auth/login` first to get JWT
- Click `Authorize` (top-right)
- Enter token as `Bearer <your_token>`
- Now test protected endpoints (`/groups`, `/expenses`, `/settle`)

## Notes

- Passwords are hashed with bcrypt before storage.
- JWT token is required for all routes except auth and health.
- Expenses use equal split for MVP.
- Group balances are simplified to who owes whom.
- Expense list supports pagination via `page` and `limit` query params.
- Swagger JSON is available at `/api/docs.json`.

## Documentation

Comprehensive docs are in [docs/README.md](docs/README.md).

Recommended path for new developers:
- [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/API_REFERENCE.md](docs/API_REFERENCE.md)
- [docs/DATA_MODELS.md](docs/DATA_MODELS.md)
- [docs/BUSINESS_LOGIC.md](docs/BUSINESS_LOGIC.md)

## Deployment

This backend is ready to deploy to Render or Railway:
- Build command: `pnpm install --frozen-lockfile`
- Start command: `pnpm start`
- Add all `.env` variables in the platform dashboard.

### VPS / Custom Domain Notes

- You do not need to hardcode your domain for Express to run.
- For VPS, set `HOST=0.0.0.0` so the app accepts external traffic.
- Point your domain DNS (A/AAAA record) to VPS IP.
- Use Nginx/Caddy as reverse proxy and SSL terminator.
- Set `PUBLIC_BASE_URL=https://mydomain.me` for accurate startup/docs URLs.
