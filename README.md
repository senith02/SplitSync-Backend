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
   npm install
   ```

2. Configure environment:
   - `.env.example` is a safe template (committed)
   - `.env` is your real local config (not committed)
   - copy template and update values:
   ```bash
   copy .env.example .env
   ```

3. Start dev server:
   ```bash
   npm run dev
   ```

4. Start production server:
   ```bash
   npm start
   ```

## Notes

- Passwords are hashed with bcrypt before storage.
- JWT token is required for all routes except auth and health.
- Expenses use equal split for MVP.
- Group balances are simplified to who owes whom.
- Expense list supports pagination via `page` and `limit` query params.

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
- Build command: `npm install`
- Start command: `npm start`
- Add all `.env` variables in the platform dashboard.
