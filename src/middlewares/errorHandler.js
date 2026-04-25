const { AppError, ConflictError, ValidationError, NotFoundError } = require("../utils/errors");

function notFoundHandler(req, res, next) {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
}

function errorHandler(error, req, res, next) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details || null
      }
    });
  }

  if (error.name === "SequelizeUniqueConstraintError") {
    const details = error.errors.map((item) => ({
      path: item.path,
      message: item.message
    }));

    const conflict = new ConflictError("Unique constraint violation");
    return res.status(conflict.statusCode).json({
      error: {
        code: conflict.code,
        message: conflict.message,
        details
      }
    });
  }

  if (error.name === "SequelizeForeignKeyConstraintError") {
    const validationError = new ValidationError("Invalid relation reference");
    return res.status(validationError.statusCode).json({
      error: {
        code: validationError.code,
        message: validationError.message,
        details: null
      }
    });
  }

  console.error(error);

  return res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong",
      details: null
    }
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
