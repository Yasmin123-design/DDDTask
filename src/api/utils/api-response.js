export class ApiResponse {

  static success(res, data, statusCode = 200, extra = {}) {
    const response = {
      status: 'success',
      ...(Array.isArray(data) && { results: data.length }),
      data,
      ...extra
    };

    return res.status(statusCode).json(response);
  }

  static fail(res, message, statusCode = 400, errorType = 'Bad Request') {
    return res.status(statusCode).json({
      status: 'fail',
      error: errorType,
      message
    });
  }

  static error(res, message, statusCode = 500, stack = undefined) {
    return res.status(statusCode).json({
      status: 'error',
      message,
      ...(stack && { stack })
    });
  }
}
