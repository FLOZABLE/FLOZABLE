// src/middlewares/validationMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';

type ValidationTarget = 'body' | 'params' | 'query' | 'headers';

export const validate = (
  schema: Joi.ObjectSchema,
  property: ValidationTarget,
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: false,
    });

    if (error) {
      const errorMessages = error.details.map((detail) =>
        detail.message.replace(/['"]+/g, ''),
      );

      console.log(errorMessages);

      res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Validation failed.',
        errors: errorMessages,
      });
      return; // Explicitly stop here
    }

    next();
  };
};
