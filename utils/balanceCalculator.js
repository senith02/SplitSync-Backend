const round = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const calculateBalances = (expenses, settlements = []) => {
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

  settlements.forEach((settlement) => {
    if (settlement.status !== 'settled') return;
    
    const fromUser = settlement.fromUser._id ? settlement.fromUser._id.toString() : settlement.fromUser.toString();
    const toUser = settlement.toUser._id ? settlement.toUser._id.toString() : settlement.toUser.toString();
    
    // fromUser pays toUser, meaning fromUser's net balance increases (they owe less),
    // and toUser's net balance decreases (they are owed less)
    net.set(fromUser, round((net.get(fromUser) || 0) + settlement.amount));
    net.set(toUser, round((net.get(toUser) || 0) - settlement.amount));
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
