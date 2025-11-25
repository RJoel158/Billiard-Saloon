function ApiError(statusCode, code, message) {
  this.statusCode = statusCode;
  this.code = code;
  this.message = message;
  this.isApiError = true;
}

function errorHandler(err, req, res, next) {
  if (err && err.isApiError) {
    return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message } });
  }
  console.error(err);
  res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Error interno' } });
}

module.exports = { errorHandler, ApiError };
