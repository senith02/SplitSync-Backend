const mongoose = require('mongoose');
const Group = require('../models/Group');
const Expense = require('../models/Expense');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const calculateBalances = require('../utils/balanceCalculator');
const Settlement = require('../models/Settlement');

const round = (value) => Math.round((value + Number.EPSILON) * 100) / 100;
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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

const createGroup = asyncHandler(async (req, res) => {
  const { name, members = [] } = req.body;
  const currentUserId = req.user._id.toString();

  const uniqueMembers = Array.from(new Set([...members, currentUserId]));

  const validMembersCount = await User.countDocuments({ _id: { $in: uniqueMembers } });
  if (validMembersCount !== uniqueMembers.length) {
    return res.status(400).json({
      success: false,
      message: 'One or more member IDs are invalid'
    });
  }

  const group = await Group.create({
    name,
    createdBy: currentUserId,
    members: uniqueMembers
  });

  const populatedGroup = await Group.findById(group._id)
    .populate('createdBy', 'name email')
    .populate('members', 'name email');

  return res.status(201).json({
    success: true,
    message: 'Group created successfully',
    data: populatedGroup
  });
});

const getGroups = asyncHandler(async (req, res) => {
  const groups = await Group.find({ members: req.user._id })
    .populate('createdBy', 'name email')
    .populate('members', 'name email')
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    count: groups.length,
    data: groups
  });
});

const getGroupsOverview = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();

  const groups = await Group.find({ members: req.user._id }).select('_id name members createdAt').sort({ createdAt: -1 }).lean();

  if (!groups.length) {
    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalGroups: 0,
          totalGroupBalance: 0,
          youAreOwed: 0,
          youOwe: 0,
          totalExpenses: 0
        },
        groups: []
      }
    });
  }

  const groupIds = groups.map((group) => group._id);
  
  const [expenses, settlements] = await Promise.all([
    Expense.find({ groupId: { $in: groupIds } })
      .select('groupId amount paidBy participants')
      .lean(),
    Settlement.find({ groupId: { $in: groupIds } })
      .select('groupId fromUser toUser amount status')
      .lean()
  ]);

  const expensesByGroup = new Map();
  const totalsByGroup = new Map();

  expenses.forEach((expense) => {
    const groupId = expense.groupId.toString();

    const groupExpenses = expensesByGroup.get(groupId) || [];
    groupExpenses.push(expense);
    expensesByGroup.set(groupId, groupExpenses);

    totalsByGroup.set(groupId, round((totalsByGroup.get(groupId) || 0) + expense.amount));
  });

  const settlementsByGroup = new Map();
  settlements.forEach((settlement) => {
    const groupId = settlement.groupId.toString();
    const groupSettlements = settlementsByGroup.get(groupId) || [];
    groupSettlements.push(settlement);
    settlementsByGroup.set(groupId, groupSettlements);
  });

  let totalGroupBalance = 0;
  let totalYouAreOwed = 0;
  let totalYouOwe = 0;
  let totalExpenses = 0;

  const groupSummaries = groups.map((group) => {
    const groupId = group._id.toString();
    const groupExpenses = expensesByGroup.get(groupId) || [];
    const groupSettlements = settlementsByGroup.get(groupId) || [];

    const balances = calculateBalances(groupExpenses, groupSettlements);
    const position = summarizeUserPosition(balances, userId);

    const groupTotalExpenses = round(totalsByGroup.get(groupId) || 0);

    totalGroupBalance = round(totalGroupBalance + position.totalBalance);
    totalYouAreOwed = round(totalYouAreOwed + position.youAreOwed);
    totalYouOwe = round(totalYouOwe + position.youOwe);
    totalExpenses = round(totalExpenses + groupTotalExpenses);

    return {
      groupId: group._id,
      name: group.name,
      memberCount: group.members.length,
      totalExpenses: groupTotalExpenses,
      totalBalance: position.totalBalance,
      youAreOwed: position.youAreOwed,
      youOwe: position.youOwe
    };
  });

  return res.status(200).json({
    success: true,
    data: {
      summary: {
        totalGroups: groups.length,
        totalGroupBalance,
        youAreOwed: totalYouAreOwed,
        youOwe: totalYouOwe,
        totalExpenses
      },
      groups: groupSummaries
    }
  });
});

const getGroupById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid group ID'
    });
  }

  const group = await Group.findById(id)
    .populate('createdBy', 'name email')
    .populate('members', 'name email');

  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }

  const isMember = group.members.some((member) => member._id.toString() === req.user._id.toString());
  if (!isMember) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You are not a member of this group.'
    });
  }

  const [expenses, settlements] = await Promise.all([
    Expense.find({ groupId: id }).populate('paidBy participants', 'name email'),
    Settlement.find({ groupId: id })
  ]);
  const balances = calculateBalances(expenses, settlements);

  return res.status(200).json({
    success: true,
    data: {
      group,
      balances
    }
  });
});

const addMember = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid group ID or user ID'
    });
  }

  const group = await Group.findById(id);
  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }

  const requesterIsMember = group.members.some((memberId) => memberId.toString() === req.user._id.toString());
  if (!requesterIsMember) {
    return res.status(403).json({
      success: false,
      message: 'Only group members can add new members'
    });
  }

  const userExists = await User.exists({ _id: userId });
  if (!userExists) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const alreadyMember = group.members.some((memberId) => memberId.toString() === userId);
  if (alreadyMember) {
    return res.status(409).json({
      success: false,
      message: 'This user is already in the group'
    });
  }

  group.members.push(userId);
  await group.save();

  const updatedGroup = await Group.findById(id)
    .populate('createdBy', 'name email')
    .populate('members', 'name email');

  return res.status(200).json({
    success: true,
    message: 'Member added successfully',
    data: updatedGroup
  });
});

const searchUsers = asyncHandler(async (req, res) => {
  const { q, limit = 10 } = req.query;

  const normalizedLimit = Math.min(Number(limit) || 10, 20);
  const safeSearchTerm = escapeRegex(q.trim());

  const users = await User.find({
    name: {
      $regex: safeSearchTerm,
      $options: 'i'
    }
  })
    .select('_id name email')
    .sort({ name: 1 })
    .limit(normalizedLimit)
    .lean();

  return res.status(200).json({
    success: true,
    count: users.length,
    data: users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email
    }))
  });
});

const getGroupBalances = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid group ID'
    });
  }

  const group = await Group.findById(id).populate('members', 'name email');
  if (!group) {
    return res.status(404).json({
      success: false,
      message: 'Group not found'
    });
  }

  const isMember = group.members.some((member) => member._id.toString() === req.user._id.toString());
  if (!isMember) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You are not a member of this group.'
    });
  }

  const [expenses, settlements] = await Promise.all([
    Expense.find({ groupId: id }).populate('paidBy participants', 'name email'),
    Settlement.find({ groupId: id })
  ]);
  const rawBalances = calculateBalances(expenses, settlements);

  const userMap = new Map(group.members.map((member) => [member._id.toString(), member]));
  const balances = rawBalances.map((item) => ({
    fromUser: {
      id: item.fromUser,
      name: userMap.get(item.fromUser)?.name || 'Unknown'
    },
    toUser: {
      id: item.toUser,
      name: userMap.get(item.toUser)?.name || 'Unknown'
    },
    amount: item.amount
  }));

  return res.status(200).json({
    success: true,
    data: balances
  });
});

module.exports = {
  createGroup,
  getGroups,
  getGroupsOverview,
  getGroupById,
  addMember,
  searchUsers,
  getGroupBalances
};
