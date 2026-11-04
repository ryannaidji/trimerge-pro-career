// Server entrypoint
import { env } from './config/env';
import { connectDB } from './lib/db';
import app from './app';

async function startServer() {
  try {
    await connectDB(env.MONGODB_URI);
    app.listen(env.PORT, () => {
      console.log(`🚀 API running on port ${env.PORT} [${env.NODE_ENV}]`);
    });
  } catch (err) {
    console.error('❌ Startup error:', err);
    process.exit(1);
  }
}

startServer();
