const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const issue = result.error.issues?.[0] || result.error.errors?.[0];
    const message = issue ? issue.message : 'Invalid request body';
    return res.status(400).json({ error: message });
  }
  req.body = result.data;
  next();
};

const validateParams = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.params);
  if (!result.success) {
    const issue = result.error.issues?.[0] || result.error.errors?.[0];
    const message = issue ? issue.message : 'Invalid URL parameters';
    return res.status(400).json({ error: message });
  }
  req.params = result.data;
  next();
};

module.exports = {
  validateBody,
  validateParams,
};
