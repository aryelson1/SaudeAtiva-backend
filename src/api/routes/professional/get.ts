import express, { NextFunction, Request, Response } from 'express';
import { param } from 'express-validator';

import { validateRequest, authenticate } from '@root/api/middlewares';
import prisma from '@routes/common/prisma';

const router = express.Router();

router.get(
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
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;

        const profissional = await prisma. profissional.findUnique({
            where: { id },
            include: {
                disponibilidades: true,
                _count: {
                    select:  {
                        agendamentos: true,
                        formularios: true,
                    },
                },
            },
        });

        if (!profissional) {
            res.status(404).json({
                errors: [{ message: 'Profissional não encontrado' }],
            });
            return;
        }

        const { senha: _, ...profissionalData } = profissional;

        res.status(200).json(profissionalData);
    }
);

export { router as getProfissionalRouter };