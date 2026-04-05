const express = require('express');
const { query } = require('express-validator');

const { getDashboardOverview } = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.use(authMiddleware);

router.get(
  '/',
  [
    query('months').optional().isInt({ min: 1, max: 12 }).withMessage('months must be between 1 and 12'),
    query('activityLimit').optional().isInt({ min: 1, max: 50 }).withMessage('activityLimit must be between 1 and 50')
  ],
  validateRequest,
  getDashboardOverview
);

module.exports = router;
