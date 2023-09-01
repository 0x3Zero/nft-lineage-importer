import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import Joi from 'joi';
import { pick } from './pick.util';

function flattenArrayObjects(array: object[]): object {
  return array.reduce((result, obj) => {
    return { ...result, ...obj };
  }, {});
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const validateRequest = (schema: object) => (req: Request, res: Response, next: NextFunction) => {
  const validSchema = pick(schema, ['params', 'query', 'body']);
  const obj = pick(req, Object.keys(validSchema));
  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: 'key', escapeHtml: false }, abortEarly: false })
    .validate(obj, {
      errors: {
        wrap: {
          label: false,
        },
      },
    });
  if (error) {
    const errorMessage = error.details.map(details => {
      return {
        [details.path[details.path.length - 1]]: capitalizeFirstLetter(details.message),
      };
    });

    return res.status(httpStatus.BAD_REQUEST).send({ success: false, error: flattenArrayObjects(errorMessage) });
  }
  Object.assign(req, value);
  return next();
};

export function isJSON(item: any) {
  let value = typeof item !== 'string' ? JSON.stringify(item) : item;
  try {
    value = JSON.parse(value);
  } catch (e) {
    return false;
  }

  return typeof value === 'object' && value !== null;
}

export function getPrismaErrorMessage(message: string) {
  let chunk = message.split('\n');
  let lastIndex = chunk.length - 1;
  return chunk[lastIndex];
}
