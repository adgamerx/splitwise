const { UnauthorizedError } = require("../utils/errors");

function attachRequestContext(req, res, next) {
  const existingContext = req.context || {};
  const headerUserId = req.header("x-user-id");
  const candidateUserId = existingContext.userId || req.userId || (headerUserId ? Number(headerUserId) : null);

  req.context = {
    ...existingContext,
    userId:
      Number.isInteger(candidateUserId) && Number(candidateUserId) > 0
        ? Number(candidateUserId)
        : undefined
  };

  next();
}

function requireUserContext(req, res, next) {
  if (!req.context || !req.context.userId) {
    throw new UnauthorizedError(
      "Missing user context. Provide user_id in request context (x-user-id header for local testing)."
    );
  }

  next();
}

module.exports = {
  attachRequestContext,
  requireUserContext
};
