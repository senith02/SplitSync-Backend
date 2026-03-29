const mongoose = require('mongoose');
const Group = require('../models/Group');
const Expense = require('../models/Expense');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const calculateBalances = require('../utils/balanceCalculator');

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

  const expenses = await Expense.find({ groupId: id }).populate('paidBy participants', 'name email');
  const balances = calculateBalances(expenses);

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
      message: 'User is already a member of this group'
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

  const expenses = await Expense.find({ groupId: id }).populate('paidBy participants', 'name email');
  const rawBalances = calculateBalances(expenses);

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
  getGroupById,
  addMember,
  getGroupBalances
};
