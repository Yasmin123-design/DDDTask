import { ApiResponse } from '../utils/api-response.js';

export function globalErrorHandler(err, req, res, next) {
  console.error('[Global Error Handler]:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  if (
    err.message.includes('required') || 
    err.message.includes('must be') || 
    err.name === 'ValidationError'
  ) {
    return ApiResponse.fail(res, err.message, 400, 'Bad Request');
  }

  if (err.message.includes('not found') || err.name === 'CastError') {
    return ApiResponse.fail(res, err.message, 404, 'Not Found');
  }
  return ApiResponse.error(
    res, 
    message, 
    status, 
    process.env.NODE_ENV === 'development' ? err.stack : undefined
  );
}
