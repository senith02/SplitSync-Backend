const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');

const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/groupRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const settlementRoutes = require('./routes/settlementRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const swaggerSpec = require('./config/swagger');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Trust proxy (Heroku, proxies) so req.protocol and secure detection work
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Redirect HTTP -> HTTPS in production (Heroku terminates TLS at the router)
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  }
});

app.use('/api', apiLimiter);
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true
    }
  })
);
app.get('/api/docs.json', (req, res) => {
  res.status(200).json(swaggerSpec);
});

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SplitSync server is running',
    health: '/api/health'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'SplitSync API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/settle', settlementRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
