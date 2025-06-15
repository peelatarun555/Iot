class HttpException extends Error {
  public status: number;
  public override message: string;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
  }
}

class ValidationException extends HttpException {
  public errors: string[];

  constructor(errors: string[]) {
    super(422, errors.toString());
    this.errors = errors;
  }
}

class AuthException extends HttpException {
  constructor(message = "Not Authorized") {
    super(401, message);
  }
}

class NotFoundException extends HttpException {
  constructor(message = "Not Found") {
    super(404, message);
  }
}

class ForbiddenException extends HttpException {
  constructor(message = "Forbidden") {
    super(403, message);
  }
}

class BadRequestException extends HttpException {
  constructor(message = "Bad Request") {
    super(400, message);
  }
}

class AlreadyExistsException extends HttpException {
  constructor(message = "Already exists") {
    super(409, message);
  }
}

class NotInTimeException extends HttpException {
  constructor(message = "Not in time") {
    super(423, message);
  }
}

export {
  AlreadyExistsException,
  AuthException,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  NotInTimeException,
  ValidationException,
};
export default HttpException;
