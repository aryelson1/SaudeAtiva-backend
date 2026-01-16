import { CustomError } from './CustomError';

export class PermissionError extends CustomError {
    statusCode = 403;

    constructor(public message: string = 'Forbidden: Access is denied.') {
        super(message);
    }

    serializeErrors() {
        return [
            {
                message: this.message,
            },
        ];
    }
}
