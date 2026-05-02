const Group = require('../models/Group');
const Expense = require('../models/Expense');
const Settlement = require('../models/Settlement');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const calculateBalances = require('../utils/balanceCalculator');

const round = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const toMonthKey = (date) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const buildMonthlyTemplate = (months) => {
  const map = new Map();
  const now = new Date();

  for (let i = months - 1; i >= 0; i -= 1) {
    const monthDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const monthKey = toMonthKey(monthDate);

    map.set(monthKey, {
      monthKey,
      monthLabel: monthDate.toLocaleString('en-US', {
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC'
      }),
      totalPaid: 0,
      totalShare: 0,
      settlementsPaid: 0,
      settlementsReceived: 0,
      involvedExpenseAmount: 0,
      expenseCount: 0,
      netBalance: 0
    });
  }

  return map;
};

const summarizeUserPosition = (balances, userId) => {
  let youAreOwed = 0;
  let youOwe = 0;

  balances.forEach((entry) => {
    if (entry.toUser === userId) {
      youAreOwed = round(youAreOwed + entry.amount);
    }

    if (entry.fromUser === userId) {
      youOwe = round(youOwe + entry.amount);
    }
  });

  return {
    youAreOwed,
    youOwe,
    totalBalance: round(youAreOwed - youOwe)
  };
};

const getDashboardOverview = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();

  const monthsRaw = Number.parseInt(req.query.months, 10);
  const months = Number.isNaN(monthsRaw) ? 6 : Math.min(Math.max(monthsRaw, 1), 12);

  const activityLimitRaw = Number.parseInt(req.query.activityLimit, 10);
  const activityLimit = Number.isNaN(activityLimitRaw) ? 10 : Math.min(Math.max(activityLimitRaw, 1), 50);

  const groups = await Group.find({ members: req.user._id }).select('_id name members').lean();

  if (!groups.length) {
    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email
        },
        summary: {
          totalBalance: 0,
          youAreOwed: 0,
          youOwe: 0
        },
        monthlyInsights: Array.from(buildMonthlyTemplate(months).values()),
        recentActivities: []
      }
    });
  }

  const groupIds = groups.map((group) => group._id);
  const groupNameById = new Map(groups.map((group) => [group._id.toString(), group.name]));

  const [expenses, settlements] = await Promise.all([
    Expense.find({ groupId: { $in: groupIds } })
      .select('_id groupId description amount paidBy participants createdAt')
      .lean(),
    Settlement.find({ groupId: { $in: groupIds } })
      .select('_id groupId fromUser toUser amount status createdAt')
      .lean()
  ]);

  const groupExpenses = new Map();
  expenses.forEach((expense) => {
    const key = expense.groupId.toString();
    const items = groupExpenses.get(key) || [];
    items.push(expense);
    groupExpenses.set(key, items);
  });

  const groupSettlements = new Map();
  settlements.forEach((settlement) => {
    const key = settlement.groupId.toString();
    const items = groupSettlements.get(key) || [];
    items.push(settlement);
    groupSettlements.set(key, items);
  });

  let youAreOwed = 0;
  let youOwe = 0;

  groups.forEach((group) => {
    const balances = calculateBalances(
      groupExpenses.get(group._id.toString()) || [],
      groupSettlements.get(group._id.toString()) || []
    );
    const position = summarizeUserPosition(balances, userId);
    youAreOwed = round(youAreOwed + position.youAreOwed);
    youOwe = round(youOwe + position.youOwe);
  });

  const monthlyMap = buildMonthlyTemplate(months);

  expenses.forEach((expense) => {
    const createdAt = new Date(expense.createdAt);
    const monthKey = toMonthKey(createdAt);
    const bucket = monthlyMap.get(monthKey);

    if (!bucket) return;

    const participants = Array.isArray(expense.participants) ? expense.participants : [];
    const participantCount = participants.length || 1;
    const share = expense.amount / participantCount;

    const isPaidByUser = expense.paidBy.toString() === userId;
    const isParticipant = participants.some((participantId) => participantId.toString() === userId);

    if (isPaidByUser) {
      bucket.totalPaid = round(bucket.totalPaid + expense.amount);
    }

    if (isParticipant) {
      bucket.totalShare = round(bucket.totalShare + share);
    }

    if (isPaidByUser || isParticipant) {
      bucket.involvedExpenseAmount = round(bucket.involvedExpenseAmount + expense.amount);
      bucket.expenseCount += 1;
    }
  });

  settlements.forEach((settlement) => {
    const createdAt = new Date(settlement.createdAt);
    const monthKey = toMonthKey(createdAt);
    const bucket = monthlyMap.get(monthKey);

    if (!bucket) return;

    if (settlement.fromUser.toString() === userId) {
      bucket.settlementsPaid = round(bucket.settlementsPaid + settlement.amount);
    }

    if (settlement.toUser.toString() === userId) {
      bucket.settlementsReceived = round(bucket.settlementsReceived + settlement.amount);
    }
  });

  const userIds = new Set([userId]);

  expenses.forEach((expense) => {
    userIds.add(expense.paidBy.toString());
    expense.participants.forEach((participantId) => userIds.add(participantId.toString()));
  });

  settlements.forEach((settlement) => {
    userIds.add(settlement.fromUser.toString());
    userIds.add(settlement.toUser.toString());
  });

  const users = await User.find({ _id: { $in: Array.from(userIds) } }).select('_id name email').lean();
  const userMap = new Map(users.map((user) => [user._id.toString(), user]));

  const expenseActivities = expenses.map((expense) => {
    const paidBy = userMap.get(expense.paidBy.toString());
    const participantsCount = Array.isArray(expense.participants) ? expense.participants.length : 0;

    let direction = 'group_activity';
    if (expense.paidBy.toString() === userId) {
      direction = 'you_paid';
    } else if (expense.participants.some((participantId) => participantId.toString() === userId)) {
      direction = 'you_participated';
    }

    return {
      id: expense._id,
      type: 'expense',
      activityType: 'expense_added',
      direction,
      amount: round(expense.amount),
      description: expense.description,
      group: {
        id: expense.groupId,
        name: groupNameById.get(expense.groupId.toString()) || 'Unknown Group'
      },
      paidBy: paidBy
        ? {
            id: paidBy._id,
            name: paidBy.name,
            email: paidBy.email
          }
        : null,
      participantsCount,
      createdAt: expense.createdAt
    };
  });

  const settlementActivities = settlements.map((settlement) => {
    const fromUser = userMap.get(settlement.fromUser.toString());
    const toUser = userMap.get(settlement.toUser.toString());

    let direction = 'group_activity';
    if (settlement.fromUser.toString() === userId) {
      direction = 'you_paid';
    } else if (settlement.toUser.toString() === userId) {
      direction = 'you_received';
    }

    return {
      id: settlement._id,
      type: 'settlement',
      activityType: 'settlement_recorded',
      direction,
      amount: round(settlement.amount),
      status: settlement.status,
      group: {
        id: settlement.groupId,
        name: groupNameById.get(settlement.groupId.toString()) || 'Unknown Group'
      },
      fromUser: fromUser
        ? {
            id: fromUser._id,
            name: fromUser.name,
            email: fromUser.email
          }
        : null,
      toUser: toUser
        ? {
            id: toUser._id,
            name: toUser.name,
            email: toUser.email
          }
        : null,
      createdAt: settlement.createdAt
    };
  });

  const recentActivities = [...expenseActivities, ...settlementActivities]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, activityLimit);

  const monthlyInsights = Array.from(monthlyMap.values()).map((item) => ({
    ...item,
    totalPaid: round(item.totalPaid),
    totalShare: round(item.totalShare),
    settlementsPaid: round(item.settlementsPaid),
    settlementsReceived: round(item.settlementsReceived),
    involvedExpenseAmount: round(item.involvedExpenseAmount),
    netBalance: round(item.totalPaid + item.settlementsReceived - item.totalShare - item.settlementsPaid)
  }));

  return res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email
      },
      summary: {
        totalBalance: round(youAreOwed - youOwe),
        youAreOwed: round(youAreOwed),
        youOwe: round(youOwe)
      },
      monthlyInsights,
      recentActivities
    }
  });
});

module.exports = {
  getDashboardOverview
};
