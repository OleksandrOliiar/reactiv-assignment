import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';

import { ValidationError } from '../errors/app-error';
import { zodErrorDetails } from '../errors/zod-details';

type RequestSchemas = {
  body?: ZodType;
  params?: ZodType;
};

export function validate(schemas: RequestSchemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const body = schemas.body ? schemas.body.safeParse(req.body) : undefined;
    const params = schemas.params ? schemas.params.safeParse(req.params) : undefined;
    const details = [
      ...(body && !body.success ? prefixDetails('body', zodErrorDetails(body.error)) : []),
      ...(params && !params.success ? prefixDetails('params', zodErrorDetails(params.error)) : []),
    ];

    if (details.length > 0) {
      next(new ValidationError('Invalid request', details));
      return;
    }

    req.validated = {
      body: body?.success ? body.data : req.body,
      params: params?.success ? params.data : req.params,
    };
    next();
  };
}

/** Reads the body and params already parsed by `validate()`. */
export function readValidated<TParams, TBody>(req: Request): { params: TParams; body: TBody } {
  if (!req.validated) {
    throw new Error('validate() must run before the controller reads the request');
  }

  return {
    params: req.validated.params as TParams,
    body: req.validated.body as TBody,
  };
}

function prefixDetails(
  prefix: string,
  details: { path: string; message: string }[],
): { path: string; message: string }[] {
  return details.map((detail) => ({
    message: detail.message,
    path: detail.path ? `${prefix}.${detail.path}` : prefix,
  }));
}
