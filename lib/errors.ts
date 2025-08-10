export class AppError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404)
    this.name = 'NotFoundError'
  }
}

export function handleApiError(error: unknown): never {
  if (error instanceof AppError) {
    throw error
  }
  
  if (error instanceof Error) {
    throw new AppError(error.message)
  }
  
  throw new AppError('An unexpected error occurred')
}

export function handleApiErrorWithResponse(error: unknown): { error: string; status: number } {
  if (error instanceof AppError) {
    return { error: error.message, status: error.statusCode }
  }
  
  if (error instanceof Error) {
    return { error: error.message, status: 500 }
  }
  
  return { error: 'An unexpected error occurred', status: 500 }
}
