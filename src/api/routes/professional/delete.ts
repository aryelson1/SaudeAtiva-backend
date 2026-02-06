import express, { NextFunction, Request, Response } from 'express';
import { param } from 'express-validator';

import { validateRequest, authenticate } from '@root/api/middlewares';
import prisma from '@routes/common/prisma';

const router = express. Router();

router.delete(
    '/api/profissional/:id',
    authenticate,
    [
        param('id')
            .notEmpty()
            .withMessage('id is required')
            .isUUID()
            .withMessage('id must be a valid UUID'),
    ],
    validateRequest,
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;

        const profissional = await prisma.profissional.findUnique({
            where: { id },
        });

        if (!profissional) {
            res.status(404).json({
                errors: [{ message: 'Profissional não encontrado' }],
            });
            return;
        }

        await prisma.profissional.update({
            where: { id },
            data: { ativo: false },
        });

        res.status(204).send();
    }
);

export { router as deleteProfissionalRouter };