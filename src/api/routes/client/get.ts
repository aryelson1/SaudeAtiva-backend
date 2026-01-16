import express, { NextFunction, Request, Response } from 'express';
import { param } from 'express-validator';

import { validateRequest, authenticate } from '@root/api/middlewares';
import prisma from '@routes/common/prisma';

const router = express.Router();

router.get(
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
    async (req:  Request, res: Response, next:  NextFunction) => {
        const { id } = req.params;

        const cliente = await prisma.cliente.findUnique({
            where: { id },
            include: {
                _count: {
                    select:  {
                        agendamentos:  true,
                        prontuarios: true,
                        respostas: true,
                    },
                },
            },
        });

        if (!cliente) {
            res.status(404).json({
                errors: [{ message: 'Cliente não encontrado' }],
            });
            return;
        }

        const { senha: _, ...clienteData } = cliente;

        res.status(200).json(clienteData);
    }
);

export { router as getClienteRouter };