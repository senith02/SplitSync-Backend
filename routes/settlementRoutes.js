const express = require('express');
const { body } = require('express-validator');

const { settlePayment } = require('../controllers/settlementController');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.use(authMiddleware);

router.post(
  '/',
  [
    body('groupId').isMongoId().withMessage('Valid group ID is required'),
    body('fromUser').isMongoId().withMessage('Valid fromUser ID is required'),
    body('toUser').isMongoId().withMessage('Valid toUser ID is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0')
  ],
  validateRequest,
  settlePayment
);

module.exports = router;
