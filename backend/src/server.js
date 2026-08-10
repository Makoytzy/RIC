import app from './app.js';
import { env } from './config/environment.js';
import { logger } from './utils/logger.js';

app.listen(env.port, () => {
  logger.info(`Inventory API listening on http://localhost:${env.port} (${env.nodeEnv})`);
});
