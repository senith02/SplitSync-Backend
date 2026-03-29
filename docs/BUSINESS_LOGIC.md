# Business Logic

## 1) Equal Expense Split (MVP)

For each expense:

- Share per participant = `amount / participantCount`
- Payer gets credited with full `amount`
- Each participant gets debited by their share

This produces a net amount for each user in the group.

## 2) Balance Simplification

After net amounts are computed:

- Users with negative net are debtors
- Users with positive net are creditors
- Greedy matching pairs debtors with creditors until all balances settle

Output:

- Simplified records of `fromUser -> toUser : amount`

## 3) Settlement Recording

When `POST /api/settle` is called:

- A `Settlement` document is stored with `status: settled`
- This is a payment log for audit/history

## 4) Access Rules

- Only authenticated users can use protected endpoints
- Users can access only groups where they are members
- Expense and settlement users must belong to the target group
