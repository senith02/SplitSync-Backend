# API Reference

Base URL: `http://localhost:5000/api`

Swagger UI: `http://localhost:5000/api/docs`

Swagger JSON: `http://localhost:5000/api/docs.json`

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

### GET /groups/:id
Get group details and computed balances.

### POST /groups/:id/add-member
Body:

```json
{
  "userId": "<userId>"
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
