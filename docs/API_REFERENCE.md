# API Reference

Base URL: `http://localhost:5000/api`

Swagger UI: `http://localhost:5000/api/docs`

Swagger JSON: `http://localhost:5000/api/docs.json`

For protected endpoints:
1. Login via `POST /auth/login`
2. Click `Authorize` in Swagger UI
3. Paste `Bearer <token>`

Auth header for protected routes:

`Authorization: Bearer <jwt_token>`

---

## Auth

### POST /auth/register

Body:

```json
{
  "name": "John",
  "email": "john@mail.com",
  "password": "123456"
}
```

### POST /auth/login

Body:

```json
{
  "email": "john@mail.com",
  "password": "123456"
}
```

---

## Groups

### POST /groups
Create group.

Body:

```json
{
  "name": "Trip to Kandy",
  "members": ["<userId1>", "<userId2>"]
}
```

### GET /groups
Get all groups where current user is a member.

### GET /groups/overview
Get groups view data for the current user.

Returns:
- summary totals for all user groups
- per-group totals including `totalExpenses`, `totalBalance`, `youAreOwed`, `youOwe`

### GET /groups/:id
Get group details and computed balances.

### POST /groups/:id/add-member
Body:

```json
{
  "userId": "<userId>"
}
```

### GET /groups/search-users?q=dev&limit=10
Search all registered users for add-member autocomplete.

Notes:
- works without a group ID, so it can also be used before creating a group
- includes registered users even if they are not in any group yet

Query params:
- `q` (required): name search text, 1 to 50 characters
- `limit` (optional): max results, 1 to 20 (default 10)

Duplicate add-member error:

If selected user is already in the group, `POST /groups/:id/add-member` returns:

```json
{
  "success": false,
  "message": "This user is already in the group"
}
```

Example response:

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "665f6c8f7e4f921f1d2a1234",
      "name": "Dev Tester",
      "email": "dev.user@splitsync.local"
    },
    {
      "id": "665f6c8f7e4f921f1d2a5678",
      "name": "Developer Milan",
      "email": "milan.dev@splitsync.local"
    }
  ]
}
```

### GET /groups/:id/balances
Get simplified balances only.

---

## Expenses

### POST /expenses
Body:

```json
{
  "groupId": "<groupId>",
  "description": "Dinner",
  "amount": 2400,
  "paidBy": "<userId>",
  "participants": ["<userId1>", "<userId2>", "<userId3>"],
  "splitType": "equal"
}
```

### GET /expenses/:groupId?page=1&limit=10
Get group expenses with pagination.

---

## Settlement

### POST /settle
Body:

```json
{
  "groupId": "<groupId>",
  "fromUser": "<userId>",
  "toUser": "<userId>",
  "amount": 500
}
```

---

## Dashboard

### GET /dashboard?months=6&activityLimit=10
Get dashboard overview for the current user.

Query params:
- `months` (optional): monthly insight range, from 1 to 12 (default 6)
- `activityLimit` (optional): max recent activity records, from 1 to 50 (default 10)

Response data includes:
- `summary`: `totalBalance`, `youAreOwed`, `youOwe`
- `monthlyInsights`: bar-chart friendly monthly metrics
- `recentActivities`: latest mixed expense + settlement activity feed

Example response shape:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "<userId>",
      "name": "Dev Tester",
      "email": "dev.user@splitsync.local"
    },
    "summary": {
      "totalBalance": 2450,
      "youAreOwed": 5600,
      "youOwe": 3150
    },
    "monthlyInsights": [
      {
        "monthKey": "2026-04",
        "monthLabel": "Apr 2026",
        "totalPaid": 15000,
        "totalShare": 3750,
        "settlementsPaid": 0,
        "settlementsReceived": 2000,
        "involvedExpenseAmount": 15000,
        "expenseCount": 1,
        "netBalance": 13250
      }
    ],
    "recentActivities": [
      {
        "id": "<activityId>",
        "type": "settlement",
        "activityType": "settlement_recorded",
        "direction": "you_received",
        "amount": 2000,
        "status": "settled",
        "group": {
          "id": "<groupId>",
          "name": "DEV - Gym Buddies"
        },
        "fromUser": {
          "id": "<userId>",
          "name": "Sahan Wickramage",
          "email": "sahan.peer@splitsync.local"
        },
        "toUser": {
          "id": "<userId>",
          "name": "Dev Tester",
          "email": "dev.user@splitsync.local"
        },
        "createdAt": "2026-04-01T12:00:00.000Z"
      }
    ]
  }
}
```

---

## Response Pattern

Success:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

Validation error:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": []
}
```
