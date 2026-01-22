import express, { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import bcrypt from 'bcryptjs';

import { validateRequest } from '@root/api/middlewares';
import { AuthenticationError } from '@root/api/errors/AuthenticationError';
import { UserJwtPayload } from '@root/api/middlewares/authenticate';
import prisma from '@routes/common/prisma';

import Uuid from '@utils/Uuid';

const router = express.Router();

router.post(
    '/api/login/professional',
    [
        body('cpf')
            .notEmpty()
            .withMessage('cpf is required')
            .isString()
            .withMessage('cpf must be a string'),
        body('password')
            .notEmpty()
            .withMessage('password is required')
            .isString()
            .withMessage('password must be a string'),
    ],
    validateRequest,
    async (req: Request, res: Response, next: NextFunction) => {
        const {
            cpf,
            password,
        } = req.body;

        const userRow = await prisma.profissional.findFirst({
            where: {
                cpf: cpf,
            }
        })

        if (!userRow) {
            throw new AuthenticationError();
        }

        const isValid = await bcrypt.compare(password, userRow.senha);

        if (!isValid) {
            throw new AuthenticationError();
        }

        const jwtPayload: UserJwtPayload = {
            id: userRow.id as Uuid,
            username: userRow.email,
        };

        const token = jwt.sign(jwtPayload, process.env.JWT_SECRET!, {
            expiresIn: '7d',
        });

        res.status(200).json({ token });
    }
);

export { router as loginProfissionalRouter };
