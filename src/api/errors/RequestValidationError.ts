import { ValidationError } from 'express-validator';

import { CustomError } from './CustomError';

export class RequestValidationError extends CustomError {
    statusCode = 400;

    constructor(public errors: ValidationError[]) {
        super('Invalid request parameters');
    }

    serializeErrors() {
        return this.errors.map((error) => {
            switch (error.type) {
                case 'field':
                    return {
                        message: error.msg,
                        field: error.path,
                    };
                /* istanbul ignore next */
                default: {
                    return {
                        message: error.msg,
                    };
                }
            }
        });
    }
}
