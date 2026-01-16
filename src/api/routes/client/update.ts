import express, { NextFunction, Request, Response } from 'express';
import { body, param } from 'express-validator';
import bcrypt from 'bcryptjs';

import { validateRequest, authenticate } from '@root/api/middlewares';
import prisma from '@routes/common/prisma';
import { GeneroCliente } from '@root/generated/prisma';

const router = express.Router();

router.put(
    '/api/cliente/:id',
    authenticate,
    [
        param('id')
            .notEmpty()
            .withMessage('id is required')
            .isUUID()
            .withMessage('id must be a valid UUID'),
        body('nome').optional().isString().withMessage('nome must be a string'),
        body('email').optional().isEmail().withMessage('email must be valid'),
        body('telefone').optional().isString().withMessage('telefone must be a string'),
        body('senha')
            .optional()
            .isLength({ min: 6 })
            .withMessage('senha must be at least 6 characters'),
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
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const {
            nome,
            email,
            telefone,
            senha,
            dataNascimento,
            genero,
            endereco,
            cidade,
            estado,
            cep,
            foto,
            observacoes,
        } = req.body;

        const cliente = await prisma.cliente.findUnique({
            where: { id },
        });

        if (!cliente) {
            res.status(404).json({
                errors: [{ message: 'Cliente não encontrado' }],
            });
            return;
        }

        const dataToUpdate: any = {
            nome,
            email,
            telefone,
            dataNascimento: dataNascimento ? new Date(dataNascimento) : undefined,
            genero: genero as GeneroCliente,
            endereco,
            cidade,
            estado,
            cep,
            foto,
            observacoes,
        };

        if (senha) {
            dataToUpdate.senha = await bcrypt. hash(senha, 10);
        }

        Object.keys(dataToUpdate).forEach(
            (key) => dataToUpdate[key] === undefined && delete dataToUpdate[key]
        );

        const updatedCliente = await prisma.cliente. update({
            where: { id },
            data: dataToUpdate,
        });

        const { senha: _, ...clienteData } = updatedCliente;

        res.status(200).json(clienteData);
    }
);

export { router as updateClienteRouter };