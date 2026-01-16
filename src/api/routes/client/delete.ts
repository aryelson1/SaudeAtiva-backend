import express, { NextFunction, Request, Response } from 'express';
import { param } from 'express-validator';

import { validateRequest, authenticate } from '@root/api/middlewares';
import prisma from '@routes/common/prisma';

const router = express. Router();

router.delete(
    '/api/cliente/:id',
    authenticate,
    [
        param('id')
            .notEmpty()
            .withMessage('id is required')
            .isUUID()
            .withMessage('id must be a valid UUID'),
    ],
    validateRequest,
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;

        const cliente = await prisma. cliente.findUnique({
            where: { id },
        });

        if (!cliente) {
            res.status(404).json({
                errors: [{ message: 'Cliente não encontrado' }],
            });
            return;
        }

        await prisma.cliente.update({
            where: { id },
            data: { ativo: false },
        });

        res.status(204).send();
    }
);

export { router as deleteClienteRouter };