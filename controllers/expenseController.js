const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const Group = require('../models/Group');
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

module.exports = {
  addExpense,
  getGroupExpenses
};
