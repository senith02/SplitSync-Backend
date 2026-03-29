require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const validateEnv = require('./config/validateEnv');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  validateEnv();
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error(`Startup failed: ${error.message}`);
  console.error('Update your .env using .env.example as reference, then restart the server.');
  process.exit(1);
});
