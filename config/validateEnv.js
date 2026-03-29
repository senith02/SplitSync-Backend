const hasPlaceholder = (value = '') => {
  const lowered = String(value).toLowerCase();
  return (
    /<[^>]+>/.test(lowered) ||
    lowered.includes('replace_with') ||
    lowered.includes('your_') ||
    lowered.includes('cluster-url')
  );
};

const validateEnv = () => {
  const required = ['MONGO_URI', 'JWT_SECRET'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (!process.env.MONGO_URI.startsWith('mongodb://') && !process.env.MONGO_URI.startsWith('mongodb+srv://')) {
    throw new Error('MONGO_URI must start with mongodb:// or mongodb+srv://');
  }

  if (hasPlaceholder(process.env.MONGO_URI)) {
    throw new Error(
      'MONGO_URI contains placeholder values. Update .env with your real MongoDB Atlas connection string.'
    );
  }

  if (hasPlaceholder(process.env.JWT_SECRET) || process.env.JWT_SECRET.length < 16) {
    throw new Error('JWT_SECRET must be a real non-placeholder secret with at least 16 characters.');
  }
};

module.exports = validateEnv;
