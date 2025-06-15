// src/utils/exceptions/restapi.exception.ts

class RestApiError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;

    // Capture the stack trace (excluding constructor)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

class ForbiddenException extends RestApiError {
  constructor(message?: string) {
    super(message ?? "Forbidden", 403, "FORBIDDEN");
  }
}

class BadRequestException extends RestApiError {
  constructor(message?: string) {
    super(message ?? "Bad Request", 400, "BAD_REQUEST");
  }
}

class ValidationException extends RestApiError {
  constructor(message?: string) {
    super(message ?? "Validation Failed", 422, "VALIDATION_FAILED");
  }
}

class AuthException extends RestApiError {
  constructor(message?: string) {
    super(message ?? "Not Authorized", 401, "UNAUTHORIZED");
  }
}

class NotFoundException extends RestApiError {
  constructor(message?: string) {
    super(message ?? "Not Found", 404, "NOT_FOUND");
  }
}

export {
  RestApiError,
  AuthException,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ValidationException,
};
