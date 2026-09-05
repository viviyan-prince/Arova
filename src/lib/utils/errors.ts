export class ArovaError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'ArovaError';
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends ArovaError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ArovaError {
  constructor(message: string) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class TrustViolationError extends ArovaError {
  constructor(message: string) {
    super(message, 403);
    this.name = 'TrustViolationError';
  }
}

export class RazorpayError extends ArovaError {
  constructor(message: string) {
    super(message, 502);
    this.name = 'RazorpayError';
  }
}

export class AIServiceError extends ArovaError {
  constructor(message: string) {
    super(message, 503);
    this.name = 'AIServiceError';
  }
}
