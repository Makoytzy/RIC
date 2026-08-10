const levels = { info: '\x1b[36m', warn: '\x1b[33m', error: '\x1b[31m' };
const reset = '\x1b[0m';

function log(level, ...args) {
  const color = levels[level] || '';
  // eslint-disable-next-line no-console
  console[level === 'warn' ? 'warn' : level === 'error' ? 'error' : 'log'](
    `${color}[${level.toUpperCase()}]${reset}`,
    new Date().toISOString(),
    ...args
  );
}

export const logger = {
  info: (...args) => log('info', ...args),
  warn: (...args) => log('warn', ...args),
  error: (...args) => log('error', ...args),
};
