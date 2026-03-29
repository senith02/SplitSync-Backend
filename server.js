require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const validateEnv = require('./config/validateEnv');

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST;

const startServer = async () => {
  validateEnv();
  await connectDB();

  const server = HOST ? app.listen(PORT, HOST) : app.listen(PORT);

  server.on('listening', () => {
    const baseUrl = process.env.PUBLIC_BASE_URL || `http://${HOST || 'localhost'}:${PORT}`;
    console.log(`Server running on ${baseUrl}`);
    console.log(`Swagger docs: ${baseUrl}/api/docs`);
  });
};

startServer().catch((error) => {
  console.error(`Startup failed: ${error.message}`);
  console.error('Update your .env using .env.example as reference, then restart the server.');
  process.exit(1);
});
