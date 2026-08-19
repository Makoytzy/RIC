import app from './app.js';
import { env } from './config/environment.js';
import { logger } from './utils/logger.js';

app.listen(env.port, '0.0.0.0', () => {
  logger.info(`Inventory API listening on http://0.0.0.0:${env.port} (${env.nodeEnv})`);
  logger.info(`Access on network: http://192.168.120.26:${env.port}`);
});
