import Logger from "@tightec/logger";
import DatabaseException from "@utils/exceptions/database.exception";
import HttpException, { ValidationException } from "@utils/exceptions/http.exception";
import { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Wrapper for async route handlers to catch thrown errors
 */
export function errorHandleAsyncMiddleware(route: RequestHandler): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await route(req, res, next);
    } catch (e) {
      next(e);
    }
  };
}

/**
 * Global Express error handler
 */
function errorMiddleware(
  error: any,
  req: Request,
  res: Response,
  _next: NextFunction // renamed to _next to avoid TS6133 error
): void {
  // Default error response
  let status = 500;
  let errorResponse: any = { error: "Something went wrong" };

  // Handle known HTTP exceptions
  if (error instanceof HttpException) {
    status = error.status;
    errorResponse = {
      error: error instanceof ValidationException ? error.errors : error.message,
    };
    Logger.http(`${status} ${req.method} ${req.originalUrl} - ${error.message}`, {
      user: res.locals['userid'] ?? "",
      body: req.body,
      query: JSON.stringify(req.query ?? {})
    });
  }
  // Handle malformed JSON
  else if (error instanceof SyntaxError && "body" in error) {
    status = 400;
    errorResponse = { error: "Malformed JSON" };
    Logger.http(`${status} ${req.method} ${req.originalUrl} - Malformed JSON`, {
      body: req.body,
      stack: error.stack ?? "",
    });
  }
  // Handle database exceptions
  else if (error instanceof DatabaseException) {
    status = 500;
    errorResponse = { error: "Database error" };
    Logger.error(`DatabaseException: ${error.message}`, {
      stack: error.stack ?? "",
      user: res.locals['userid'] ?? "",
    });
  }
  // Handle generic errors
  else if (error instanceof Error) {
    status = 500;
    errorResponse = { error: error.message || "Internal server error" };
    Logger.error(`Unhandled error: ${error.message}`, {
      stack: error.stack ?? "",
      user: res.locals['userid'] ?? "",
    });
  }
  // Handle unknown error types
  else {
    Logger.error(`Unknown error: ${JSON.stringify(error)}`);
  }

  res.status(status).json(errorResponse);
  // Not calling next() here because this is the final error handler
}

export default errorMiddleware;
