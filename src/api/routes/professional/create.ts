import express, { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcryptjs';

import { validateRequest } from '@root/api/middlewares';
import prisma from '@routes/common/prisma';
import { TipoProfissional } from '@root/generated/prisma';

const router = express.Router();

router.post(
    '/api/profissional',
    [
        body('nome')
            .notEmpty()
            .withMessage('nome is required')
            .isString()
            .withMessage('nome must be a string'),
        body('email')
            .notEmpty()
            .withMessage('email is required')
            .isEmail()
            .withMessage('email must be valid'),
        body('senha')
            .notEmpty()
            .withMessage('senha is required')
            .isLength({ min: 6 })
            .withMessage('senha must be at least 6 characters'),
        body('cpf')
            .notEmpty()
            .withMessage('cpf is required')
            .isString()
            .withMessage('cpf must be a string'),
        body('tipo')
            .notEmpty()
            .withMessage('tipo is required')
            .isIn(['NUTRICIONISTA', 'PSICOLOGO'])
            .withMessage('tipo must be NUTRICIONISTA or PSICOLOGO'),
        body('registro')
            .notEmpty()
            .withMessage('registro is required')
            .isString()
            .withMessage('registro must be a string'),
        body('telefone')
            .optional()
            .isString()
            .withMessage('telefone must be a string'),
        body('especialidade')
            .optional()
            .isString()
            .withMessage('especialidade must be a string'),
        body('bio')
            .optional()
            .isString()
            .withMessage('bio must be a string'),
    ],
    validateRequest,
    async (req: Request, res: Response, next: NextFunction) => {
        const {
            nome,
            email,
            senha,
            cpf,
            tipo,
            registro,
            telefone,
            especialidade,
            bio,
            foto,
        } = req.body;

        const existingProfissional = await prisma.profissional.findFirst({
            where: {
                OR: [
                    { email },
                    { cpf },
                    { registro },
                ],
            },
        });

        if (existingProfissional) {
            res.status(400).json({
                errors: [{ message: 'Email, CPF ou Registro já cadastrado' }],
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(senha, 10);

        const profissional = await prisma.profissional.create({
            data: {
                nome,
                email,
                senha: hashedPassword,
                cpf,
                tipo:  tipo as TipoProfissional,
                registro,
                telefone,
                especialidade,
                bio,
                foto,
            },
        });

        const { senha: _, ...profissionalData } = profissional;

        res.status(201).json(profissionalData);
    }
);

export { router as createProfissionalRouter };