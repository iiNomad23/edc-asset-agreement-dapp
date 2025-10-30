export abstract class AppError extends Error {
    public abstract readonly statusCode: number;
}
