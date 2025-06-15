class DatabaseException extends Error {
  public override message: string;
  public error?: Error;

  constructor(message: string, error?: Error) {
    super(message);
    this.message = message;
    this.error = error;
  }
}

class DatabaseTimeoutException extends DatabaseException {
  constructor(message?: string, error?: Error) {
    super(message ?? "Database connection timed out", error);
  }
}

class DatabaseRefusedException extends DatabaseException {
  constructor(message?: string, error?: Error) {
    super(message ?? "Database refused connection", error);
  }
}

class DatabaseCountException extends DatabaseException {
  constructor(message?: string, error?: Error) {
    super(message ?? "Database has too many connections", error);
  }
}

class DatabaseLostConnectionException extends DatabaseException {
  constructor(message?: string, error?: Error) {
    super(message ?? "Database lost connection", error);
  }
}

export default DatabaseException;

export {
  DatabaseCountException,
  DatabaseLostConnectionException,
  DatabaseRefusedException,
  DatabaseTimeoutException,
};
