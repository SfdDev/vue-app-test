import type { H3Event } from 'h3';
import {
  ConflictError,
  DomainError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../../domain/errors';

export function mapDomainError(error: unknown): never {
  if (error && typeof error === 'object' && 'statusCode' in error) {
    throw error;
  }

  if (error instanceof UnauthorizedError) {
    throw createError({ statusCode: 401, statusMessage: error.message });
  }
  if (error instanceof ForbiddenError) {
    throw createError({ statusCode: 403, statusMessage: error.message });
  }
  if (error instanceof NotFoundError) {
    throw createError({ statusCode: 404, statusMessage: error.message });
  }
  if (error instanceof ConflictError || error instanceof ValidationError) {
    throw createError({ statusCode: 400, statusMessage: error.message });
  }
  if (error instanceof DomainError) {
    throw createError({ statusCode: 400, statusMessage: error.message });
  }

  const message = error instanceof Error ? error.message : 'Internal server error';
  throw createError({ statusCode: 500, statusMessage: message });
}

export function withMappedErrors<T>(fn: (event: H3Event) => Promise<T>) {
  return async (event: H3Event): Promise<T> => {
    try {
      return await fn(event);
    } catch (error) {
      mapDomainError(error);
    }
  };
}
