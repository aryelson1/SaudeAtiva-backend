import { NextFunction, Request, Response } from 'express';

import { CustomError } from '../errors/CustomError';

/* istanbul ignore next */
export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (err instanceof CustomError) {
        res.status(err.statusCode).send({ errors: err.serializeErrors() });
    } else {
        res.status(400).send({
            errors: [
                {
                    message: 'Something went wrong',
                },
            ],
        });
    }
    console.error(err);
};
