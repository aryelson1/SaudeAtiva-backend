import express, { NextFunction, Request, Response } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcryptjs';

import { validateRequest } from '@root/api/middlewares';
import prisma from '@routes/common/prisma';
import { GeneroCliente } from '@root/generated/prisma';

const router = express.Router();

router.post(
    '/api/cliente',
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
        body('telefone')
            .notEmpty()
            .withMessage('telefone is required')
            .isString()
            .withMessage('telefone must be a string'),
        body('senha')
            .optional()
            .isLength({ min: 6 })
            .withMessage('senha must be at least 6 characters'),
        body('cpf').optional().isString().withMessage('cpf must be a string'),
        body('dataNascimento')
            .optional()
            .isISO8601()
            .withMessage('dataNascimento must be a valid date'),
        body('genero')
            .optional()
            .isIn(['MASCULINO', 'FEMININO', 'OUTRO', 'NAO_INFORMAR'])
            .withMessage('genero must be valid'),
    ],
    validateRequest,
    async (req: Request, res:  Response, next: NextFunction) => {
        const {
            nome,
            email,
            telefone,
            senha,
            cpf,
            dataNascimento,
            genero,
            endereco,
            cidade,
            estado,
            cep,
            foto,
            observacoes,
        } = req. body;

        const existingCliente = await prisma.cliente.findFirst({
            where: {
                OR: [{ email }, cpf ?  { cpf } : undefined]. filter(Boolean) as any,
            },
        });

        if (existingCliente) {
            res.status(400).json({
                errors: [{ message: 'Email ou CPF já cadastrado' }],
            });
            return;
        }

        const dataToCreate: any = {
            nome,
            email,
            telefone,
            cpf,
            dataNascimento:  dataNascimento ? new Date(dataNascimento) : undefined,
            genero:  genero as GeneroCliente,
            endereco,
            cidade,
            estado,
            cep,
            foto,
            observacoes,
        };

        // Hash da senha se fornecida
        if (senha) {
            dataToCreate.senha = await bcrypt. hash(senha, 10);
        }

        const cliente = await prisma.cliente.create({
            data: dataToCreate,
        });

        const { senha: _, ...clienteData } = cliente;

        res.status(201).json(clienteData);
    }
);

export { router as createClienteRouter };