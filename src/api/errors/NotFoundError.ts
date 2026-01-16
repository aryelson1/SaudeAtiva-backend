import { CustomError } from './CustomError';

export class NotFoundError extends CustomError {
    statusCode: number = 404;

    constructor(message: string) {
        super(message);
    }

    serializeErrors(): { message: string; field?: string | undefined }[] {
        return [
            {
                message: this.message,
            },
        ];
    }
}
