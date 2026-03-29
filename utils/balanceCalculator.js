const round = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const calculateBalances = (expenses) => {
  const net = new Map();

  expenses.forEach((expense) => {
    const paidBy = expense.paidBy._id ? expense.paidBy._id.toString() : expense.paidBy.toString();
    const participants = expense.participants.map((participant) =>
      participant._id ? participant._id.toString() : participant.toString()
    );

    if (!participants.length) return;

    const share = expense.amount / participants.length;

    net.set(paidBy, round((net.get(paidBy) || 0) + expense.amount));

    participants.forEach((participantId) => {
      net.set(participantId, round((net.get(participantId) || 0) - share));
    });
  });

  const debtors = [];
  const creditors = [];

  for (const [userId, amount] of net.entries()) {
    if (amount < -0.01) debtors.push({ userId, amount: Math.abs(amount) });
    if (amount > 0.01) creditors.push({ userId, amount });
  }

  const balances = [];
  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];

    const settleAmount = round(Math.min(debtor.amount, creditor.amount));

    if (settleAmount > 0) {
      balances.push({
        fromUser: debtor.userId,
        toUser: creditor.userId,
        amount: settleAmount
      });
    }

    debtor.amount = round(debtor.amount - settleAmount);
    creditor.amount = round(creditor.amount - settleAmount);

    if (debtor.amount <= 0.01) debtorIndex += 1;
    if (creditor.amount <= 0.01) creditorIndex += 1;
  }

  return balances;
};

module.exports = calculateBalances;
