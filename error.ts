class BaseError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, BaseError.prototype);
  }
}

class ValidationError extends BaseError {
  data: Record<string, string>[];
  constructor(data: Record<string, string>[]) {
    super("Validation Error", 400);
    this.data = data;
    this.status = 400;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export { ValidationError, BaseError };
