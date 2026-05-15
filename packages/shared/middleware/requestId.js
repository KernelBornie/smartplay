const { v4: uuidv4 } = require('uuid');

function requestId(req, res, next) {
  const incomingId = req.headers['x-request-id'] || req.headers['x-correlation-id'];
  req.requestId = incomingId || uuidv4();
  res.setHeader('x-request-id', req.requestId);
  res.setHeader('x-correlation-id', req.requestId);
  next();
}

module.exports = requestId;