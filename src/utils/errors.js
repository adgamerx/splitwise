class AppError extends Error {
  constructor(message, statusCode, code, details) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details) {
    super(message || "Validation failed", 400, "VALIDATION_ERROR", details);
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message || "Resource not found", 404, "NOT_FOUND");
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message || "Conflict", 409, "CONFLICT");
  }
}

class UnauthorizedError extends AppError {
  constructor(message) {
    super(message || "Unauthorized", 401, "UNAUTHORIZED");
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  UnauthorizedError
};
