// src/middlewares/validationMiddleware.ts
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import Joi from 'joi';

type ValidationTarget = 'body' | 'params' | 'query' | 'headers';

export const validate = (
  schema: Joi.ObjectSchema,
  property: ValidationTarget,
) => {
  return (
    req: Request<{}, {}, {}, {}>,
    res: Response,
    next: NextFunction,
  ): void => {
    const { error } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: false,
    });

    if (error) {
      const errorMessages = error.details.map((detail) =>
        detail.message.replace(/['"]+/g, ''),
      );

      res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Validation failed.',
        errors: errorMessages,
      });
      return; // Explicitly stop here
    }

    next();
  };
};
