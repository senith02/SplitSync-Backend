# Data Models

## User

Fields:
- `_id`
- `name`
- `email` (unique)
- `password` (hashed, not selected by default)
- `createdAt`, `updatedAt`

Rules:
- Password is hashed in pre-save hook
- Email is normalized to lowercase

## Group

Fields:
- `_id`
- `name`
- `createdBy` (ref User)
- `members` (array of User refs)
- `createdAt`, `updatedAt`

Rules:
- Creator is always included in members

## Expense

Fields:
- `_id`
- `groupId` (ref Group)
- `description`
- `amount`
- `paidBy` (ref User)
- `participants` (array of User refs)
- `splitType` (`equal` for MVP)
- `createdAt`, `updatedAt`

Rules:
- `amount > 0`
- Payer and participants must belong to the group

## Settlement

Fields:
- `_id`
- `groupId` (ref Group)
- `fromUser` (ref User)
- `toUser` (ref User)
- `amount`
- `status` (`pending` | `settled`)
- `createdAt`, `updatedAt`

Rules:
- `fromUser !== toUser`
- Both users must be members of the group
