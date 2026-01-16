import { CustomError } from './CustomError';

export class AuthenticationError extends CustomError {
    statusCode = 401;

    constructor(public message: string = 'Unauthorized') {
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
