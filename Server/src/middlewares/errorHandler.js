const ApiError = require('./apiError');

function errorHandler(err, req, res, next) {
  if (err && err.isApiError) {
    return res.status(err.statusCode).json({ 
      success: false,
      message: err.message,
      error: { 
        code: err.code, 
        message: err.message 
      } 
    });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    success: false,
    message: 'Error interno del servidor',
    error: { 
      code: 'INTERNAL_ERROR', 
      message: 'Error interno' 
    } 
  });
}

module.exports = errorHandler;
