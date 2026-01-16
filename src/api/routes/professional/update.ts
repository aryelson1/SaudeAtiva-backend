import express, { NextFunction, Request, Response } from 'express';
import { body, param } from 'express-validator';
import bcrypt from 'bcryptjs';

import { validateRequest, authenticate } from '@root/api/middlewares';
import prisma from '@routes/common/prisma';

const router = express.Router();

router.put(
    '/api/profissional/:id',
    authenticate,
    [
        param('id')
            .notEmpty()
            .withMessage('id is required')
            .isUUID()
            .withMessage('id must be a valid UUID'),
        body('nome').optional().isString().withMessage('nome must be a string'),
        body('email').optional().isEmail().withMessage('email must be valid'),
        body('senha')
            .optional()
            .isLength({ min: 6 })
            .withMessage('senha must be at least 6 characters'),
        body('telefone').optional().isString().withMessage('telefone must be a string'),
        body('especialidade')
            .optional()
            .isString()
            .withMessage('especialidade must be a string'),
        body('bio').optional().isString().withMessage('bio must be a string'),
        body('foto').optional().isString().withMessage('foto must be a string'),
    ],
    validateRequest,
    async (req: Request, res:  Response, next: NextFunction) => {
        const { id } = req.params;
        const { nome, email, senha, telefone, especialidade, bio, foto } = req.body;

        const profissional = await prisma. profissional.findUnique({
            where: { id },
        });

        if (!profissional) {
            res.status(404).json({
                errors: [{ message: 'Profissional não encontrado' }],
            });
            return;
        }

        const dataToUpdate:  any = {
            nome,
            email,
            telefone,
            especialidade,
            bio,
            foto,
        };

        if (senha) {
            dataToUpdate.senha = await bcrypt.hash(senha, 10);
        }

        Object.keys(dataToUpdate).forEach(
            (key) => dataToUpdate[key] === undefined && delete dataToUpdate[key]
        );

        const updatedProfissional = await prisma.profissional.update({
            where: { id },
            data: dataToUpdate,
        });

        const { senha: _, ...profissionalData } = updatedProfissional;

        res.status(200).json(profissionalData);
    }
);

export { router as updateProfissionalRouter };