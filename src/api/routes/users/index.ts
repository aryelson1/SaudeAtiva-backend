import express, { NextFunction, Request, Response } from 'express';

import { authenticate } from '@root/api/middlewares/authenticate';
import { NotFoundError } from '@root/api/errors';

import prisma from '@routes/common/prisma';
import { IUserResponse } from './type';

const router = express.Router();

router.get(
    '/api/users/:id',
    authenticate,
    async (req: Request, res: Response<IUserResponse>, next: NextFunction) => {
        const { id } = req.params;

        const userRow = await prisma.users.findFirst({
            where: {
                id,
            },
        });

        if (!userRow) {
            throw new NotFoundError('User not found');
        }

        const user: IUserResponse = {
            id: userRow.id,
            username: userRow.username,
        };

        res.status(200).json(user);
    }
);

export { router as indexUsersRouter };
