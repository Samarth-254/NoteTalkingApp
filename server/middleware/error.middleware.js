function notFoundHandler(req, res, next) {
  res.status(404).json({ error: 'Endpoint not found' });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err.code === '23505') {
    return res.status(409).json({ error: 'Email already exists' });
  }

  if (err.code === '22P02') {
    return res.status(400).json({ error: 'Invalid data format' });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  res.status(statusCode).json({ error: message });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
