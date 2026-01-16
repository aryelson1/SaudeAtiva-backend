import express, { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcryptjs';

import prisma from '@routes/common/prisma';

import { authenticate } from '@root/api/middlewares/authenticate';
import { validateRequest } from '@root/api/middlewares';
import { PermissionError } from '@root/api/errors/PermissionError';

import { NotFoundError } from '@root/api/errors';

const router = express.Router();

router.put(
    '/api/users/:id/password',
    [
        body('newPassword')
            .notEmpty()
            .withMessage('newPassword is required')
            .isString()
            .withMessage('newPassword must be a string'),
    ],
    validateRequest,
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        const { id: userId } = req.params;

        const { newPassword } = req.body;

        const { id } = req.user!;

        /// TODO: Allow users with permission to change another user's password
        if (userId !== id) {
            throw new PermissionError();
        }

        const userRow = await prisma.users.findFirst({
            where: {
                id,
            },
        });

        if (!userRow) {
            throw new NotFoundError('User not found');
        }

        const saltRounds = 10;
        const newPasswordHashed = await bcrypt.hash(newPassword, saltRounds);

        await prisma.users.update({
            data: {
                password: newPasswordHashed,
            },
            where: {
                id: id,
            },
        });

        res.status(204).send();
    }
);

export { router as updateUserRouter };
