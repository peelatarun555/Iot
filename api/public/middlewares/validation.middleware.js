"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_exception_1 = require("@utils/exceptions/http.exception");
function validationMiddleware(schema, content = "body") {
    return async (req, _res, next) => {
        const validationOptions = {
            abortEarly: false,
            allowUnknown: true,
            stripUnknown: true,
        };
        try {
            switch (content) {
                case "query":
                    req.query = await schema.validateAsync(req.query, validationOptions);
                    return next();
                case "params":
                    req.params = await schema.validateAsync(req.params, validationOptions);
                    return next();
                default:
                    req.body = await schema.validateAsync(req.body, validationOptions);
                    return next();
            }
        }
        catch (err) {
            const errors = [];
            err.details.forEach((error) => {
                errors.push(error.message.split('"').join("'"));
            });
            next(new http_exception_1.ValidationException(errors));
        }
    };
}
exports.default = validationMiddleware;
