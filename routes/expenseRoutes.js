const express = require('express');
const { body, param, query } = require('express-validator');

const { addExpense, getGroupExpenses, getExpenseDetails } = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.use(authMiddleware);

router.post(
  '/',
  [
    body('groupId').isMongoId().withMessage('Valid groupId is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
    body('paidBy').isMongoId().withMessage('Valid paidBy user ID is required'),
    body('participants').isArray({ min: 1 }).withMessage('At least one participant is required'),
    body('participants.*').isMongoId().withMessage('Each participant must be a valid user ID'),
    body('splitType').optional().isIn(['equal']).withMessage('splitType must be equal for MVP')
  ],
  validateRequest,
  addExpense
);

router.get(
  '/detail/:expenseId',
  [
    param('expenseId').isMongoId().withMessage('Valid expense ID is required')
  ],
  validateRequest,
  getExpenseDetails
);

router.get(
  '/:groupId',
  [
    param('groupId').isMongoId().withMessage('Valid group ID is required'),
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100')
  ],
  validateRequest,
  getGroupExpenses
);

module.exports = router;
