const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const Group = require('../models/Group');
const Settlement = require('../models/Settlement');
const asyncHandler = require('../utils/asyncHandler');

const addExpense = asyncHandler(async (req, res) => {
  const { groupId, description, amount, paidBy, participants, splitType = 'equal' } = req.body;

  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid group ID'
    });
  }

  const group = await Group.findById(groupId);
  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }

  const currentUserIsMember = group.members.some((memberId) => memberId.toString() === req.user._id.toString());
  if (!currentUserIsMember) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You are not a member of this group.'
    });
  }

  const paidByInGroup = group.members.some((memberId) => memberId.toString() === paidBy);
  if (!paidByInGroup) {
    return res.status(400).json({
      success: false,
      message: 'Payer must be a member of the group'
    });
  }

  const allParticipantsInGroup = participants.every((participantId) =>
    group.members.some((memberId) => memberId.toString() === participantId)
  );

  if (!allParticipantsInGroup) {
    return res.status(400).json({
      success: false,
      message: 'All participants must be members of the group'
    });
  }

  const expense = await Expense.create({
    groupId,
    description,
    amount,
    paidBy,
    participants,
    splitType
  });

  const populatedExpense = await Expense.findById(expense._id).populate('paidBy participants groupId', 'name email');

  return res.status(201).json({
    success: true,
    message: 'Expense added successfully',
    data: populatedExpense
  });
});

const getGroupExpenses = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid group ID'
    });
  }

  const group = await Group.findById(groupId);
  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }

  const isMember = group.members.some((memberId) => memberId.toString() === req.user._id.toString());
  if (!isMember) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You are not a member of this group.'
    });
  }

  const skip = (page - 1) * limit;
  const [expenses, total] = await Promise.all([
    Expense.find({ groupId })
      .populate('paidBy participants', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Expense.countDocuments({ groupId })
  ]);

  return res.status(200).json({
    success: true,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    },
    data: expenses
  });
});

const getExpenseDetails = asyncHandler(async (req, res) => {
  const { expenseId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(expenseId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid expense ID'
    });
  }

  const expense = await Expense.findById(expenseId)
    .populate('paidBy', 'name email')
    .populate('participants', 'name email')
    .populate('groupId', 'name');

  if (!expense) {
    return res.status(404).json({
      success: false,
      message: 'Expense not found'
    });
  }

  const group = await Group.findById(expense.groupId);
  const isMember = group.members.some((memberId) => memberId.toString() === req.user._id.toString());
  if (!isMember) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You are not a member of this group.'
    });
  }

  const round = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
  
  const totalAmount = expense.amount;
  const participantCount = expense.participants.length;
  const splitAmount = participantCount > 0 ? round(totalAmount / participantCount) : 0;

  const expenseSettlements = await Settlement.find({ expenseId });
  let collectedAmount = 0;

  expenseSettlements.forEach(settlement => {
    if (settlement.toUser.toString() === expense.paidBy._id.toString() && settlement.status === 'settled') {
      collectedAmount = round(collectedAmount + settlement.amount);
    }
  });

  let totalDebt = 0;
  const pendingSettlements = [];

  expense.participants.forEach(participant => {
    if (participant._id.toString() !== expense.paidBy._id.toString()) {
      // Check if this user has already paid via expenseSettlements
      let userSettled = 0;
      expenseSettlements.forEach(s => {
        if (s.fromUser.toString() === participant._id.toString() && s.toUser.toString() === expense.paidBy._id.toString() && s.status === 'settled') {
          userSettled = round(userSettled + s.amount);
        }
      });
      
      const owesNow = round(splitAmount - userSettled);
      if (owesNow > 0) {
        pendingSettlements.push({
          user: participant,
          owes: owesNow,
          to: expense.paidBy
        });
        totalDebt = round(totalDebt + owesNow);
      }
    }
  });

  const collectedPercentage = totalAmount > splitAmount ? Math.min(round((collectedAmount / (totalAmount - splitAmount)) * 100), 100) : 100;

  return res.status(200).json({
    success: true,
    data: {
      expense,
      exactDetails: {
        totalAmount,
        totalDebt,
        collectedAmount,
        collectedPercentage,
        splitAmount,
        pendingSettlements
      }
    }
  });
});

module.exports = {
  addExpense,
  getGroupExpenses,
  getExpenseDetails
};
