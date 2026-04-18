const express = require('express');
const { body, param, query } = require('express-validator');

const {
  createGroup,
  getGroups,
  getGroupsOverview,
  getGroupById,
  addMember,
  searchUsers,
  getGroupBalances
} = require('../controllers/groupController');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.use(authMiddleware);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Group name is required'),
    body('members').optional().isArray().withMessage('Members must be an array')
  ],
  validateRequest,
  createGroup
);

router.get('/', getGroups);

router.get('/overview', getGroupsOverview);

router.get(
  '/search-users',
  [
    query('q')
      .trim()
      .notEmpty()
      .withMessage('Search text is required')
      .isLength({ min: 1, max: 50 })
      .withMessage('Search text must be between 1 and 50 characters'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 20 })
      .withMessage('Limit must be an integer between 1 and 20')
      .toInt()
  ],
  validateRequest,
  searchUsers
);

router.post(
  '/:id/add-member',
  [
    param('id').isMongoId().withMessage('Valid group ID is required'),
    body('userId').isMongoId().withMessage('Valid user ID is required')
  ],
  validateRequest,
  addMember
);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Valid group ID is required')],
  validateRequest,
  getGroupById
);

router.get(
  '/:id/balances',
  [param('id').isMongoId().withMessage('Valid group ID is required')],
  validateRequest,
  getGroupBalances
);

module.exports = router;
