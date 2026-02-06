import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import Uuid from '@utils/Uuid';

import { AuthenticationError } from '../errors/AuthenticationError';

export type UserJwtPayload = {
    id: Uuid;
    username: string;
    contextFilter?: {};
    type?: string;
    specialty?: string;
    photo?: string;
};

declare global {
    namespace Express {
        interface Request {
            user?: UserJwtPayload;
        }
    }
}

export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new AuthenticationError();
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
        throw new AuthenticationError();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);

        req.user = decoded as UserJwtPayload;

        next();
    } catch (error) {
        throw new AuthenticationError('Invalid or expired token.');
    }
};
