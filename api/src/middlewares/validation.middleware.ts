import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { ValidationException } from "@utils/exceptions/http.exception";

function validationMiddleware<T extends object>(
  dtoClass: new () => T,
  content: "body" | "query" | "params" = "body"
): RequestHandler {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    // Get the content to validate
    const target = {
      body: req.body,
      query: req.query,
      params: req.params,
    }[content];

    // Convert plain object to DTO instance
    const dto = plainToInstance(dtoClass, target);

    // Validate using class-validator
    const errors: ValidationError[] = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      const messages = errors.flatMap(error => 
        Object.values(error.constraints || {})
      ).map(msg => msg.replace(/"/g, "'"));
      
      return next(new ValidationException(messages));
    }

    // Replace content with validated and transformed data
    switch (content) {
      case "query":
        req.query = dto as any;
        break;
      case "params":
        req.params = dto as any;
        break;
      default:
        req.body = dto;
    }

    next();
  };
}

export default validationMiddleware;
