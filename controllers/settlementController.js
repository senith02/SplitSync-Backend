const mongoose = require('mongoose');
const Settlement = require('../models/Settlement');
const Group = require('../models/Group');
const asyncHandler = require('../utils/asyncHandler');

const settlePayment = asyncHandler(async (req, res) => {
  const { groupId, expenseId, fromUser, toUser, amount } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(groupId) ||
    !mongoose.Types.ObjectId.isValid(fromUser) ||
    !mongoose.Types.ObjectId.isValid(toUser)
  ) {
    return res.status(400).json({
      success: false,
      message: 'Invalid group or user IDs'
    });
  }

  if (expenseId && !mongoose.Types.ObjectId.isValid(expenseId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid expense ID'
    });
  }

  if (fromUser === toUser) {
    return res.status(400).json({
      success: false,
      message: 'fromUser and toUser cannot be the same'
    });
  }

  const group = await Group.findById(groupId);
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
      message: 'Access denied. You are not a member of this group.'
    });
  }

  const validUsers = [fromUser, toUser].every((userId) =>
    group.members.some((memberId) => memberId.toString() === userId)
  );

  if (!validUsers) {
    return res.status(400).json({
      success: false,
      message: 'Settlement users must be group members'
    });
  }

  const settlement = await Settlement.create({
    groupId,
    expenseId: expenseId || undefined,
    fromUser,
    toUser,
    amount,
    status: 'settled'
  });

  const populatedSettlement = await Settlement.findById(settlement._id).populate(
    'groupId fromUser toUser',
    'name email'
  );

  return res.status(201).json({
    success: true,
    message: 'Payment marked as settled',
    data: populatedSettlement
  });
});

module.exports = {
  settlePayment
};
