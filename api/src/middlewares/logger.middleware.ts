import { Request, Response, NextFunction, RequestHandler } from "express";
import Logger from "@tightec/logger";

/**
 * Express middleware to log HTTP method, URL, and response time
 */
const loggerMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    Logger.http(`${req.method} ${req.originalUrl} [${duration} ms]`);
  });

  next();
};

export default loggerMiddleware;
