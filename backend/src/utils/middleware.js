const logger = require('./logger');

function requireClientId(req, res, next) {
  const clientId = req.header('X-Client-Id');
  if (!clientId || typeof clientId !== 'string' || clientId.length < 8) {
    return res.status(400).json({ error: 'Missing or invalid X-Client-Id' });
  }
  req.clientId = clientId;
  next();
}

function errorHandler(err, req, res, next) { // eslint-disable-line
  logger.error('Unhandled error', { error: err?.message, stack: err?.stack });
  res.status(500).json({ error: 'Internal Server Error' });
}

module.exports = { requireClientId, errorHandler };

