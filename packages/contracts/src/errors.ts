import { z } from 'zod';

export const ERROR_CODES = [
  'VALIDATION_ERROR',
  'UNAUTHORIZED',
  'NOT_FOUND',
  'CONFLICT',
  'INTERNAL',
] as const;

export const errorCodeSchema = z.enum(ERROR_CODES);

export const errorDetailSchema = z.object({
  path: z.string(),
  message: z.string(),
});

export const errorResponseSchema = z.object({
  error: z.object({
    code: errorCodeSchema,
    message: z.string().min(1),
    details: z.array(errorDetailSchema).optional(),
  }),
});

export type ErrorCode = z.infer<typeof errorCodeSchema>;
export type ErrorDetail = z.infer<typeof errorDetailSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
