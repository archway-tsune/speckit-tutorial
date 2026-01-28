class AppError extends Error {
  constructor(code, message, statusCode, details = null) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details }),
      },
    };
  }
}

class ValidationError extends AppError {
  constructor(message, details = null) {
    super('VALIDATION_ERROR', message, 422, details);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = '認証が必要です') {
    super('UNAUTHORIZED', message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'アクセス権限がありません') {
    super('FORBIDDEN', message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'リソースが見つかりません') {
    super('NOT_FOUND', message, 404);
  }
}

class RateLimitError extends AppError {
  constructor(message = 'リクエスト制限を超えました。しばらくしてから再試行してください') {
    super('RATE_LIMIT_EXCEEDED', message, 429);
  }
}

class InternalError extends AppError {
  constructor(message = 'サーバー内部エラーが発生しました') {
    super('INTERNAL_ERROR', message, 500);
  }
}

module.exports = {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  InternalError,
};
