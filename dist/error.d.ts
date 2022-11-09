declare class BaseError extends Error {
    status: number;
    constructor(message: string, status?: number);
}
declare class ValidationError extends BaseError {
    data: Record<string, string>[];
    constructor(data: Record<string, string>[]);
}
export { ValidationError, BaseError };
