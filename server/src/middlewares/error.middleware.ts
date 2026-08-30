import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';
import { ZodError } from 'zod';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  console.error('[Error Middleware]:', err);

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    sendError(res, 'Validation failed for request parameters', 400, formattedErrors);
    return;
  }

  if (err.name === 'UnauthorizedError' || err.message.includes('jwt')) {
    sendError(res, 'Invalid or expired credentials', 401);
    return;
  }

  const message = err.message || 'Internal server error occurred';
  sendError(res, message, 500);
};
