import express, { NextFunction, Request, Response } from 'express';
import prisma from '@routes/common/prisma';
import { NotFoundError } from '@root/api/errors';
import { body } from 'express-validator';
import { authenticate, validateRequest } from '@root/api/middlewares';

const router = express.Router();

// GET - Buscar formulários ativos de um profissional
router.get(
    '/api/questionnaire/:professionalId',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { professionalId } = req.params;

            // Buscar profissional
            const profissional = await prisma.profissional.findUnique({
                where: { id: professionalId, ativo: true },
                select: {
                    id: true,
                    nome: true,
                    tipo: true,
                    especialidade: true,
                    foto: true,
                    bio: true,
                },
            });

            if (!profissional) {
                throw new NotFoundError('Profissional não encontrado');
            }

            // Buscar formulários ativos do profissional
            const formularios = await prisma.formulario.findMany({
                where: {
                    OR: [
                        { profissionalId: professionalId },
                    ],
                    ativo: true,
                },
                select: {
                    id: true,
                    titulo: true,
                    descricao: true,
                    tipo: true,
                    perguntas: true,
                    obrigatorio: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            res.status(200).json({
                success: true,
                data: {
                    professional: profissional,
                    questionnaires: formularios,
                },
            });
        } catch (error) {
            next(error);
        }
    }
);

// POST - Enviar resposta do formulário
router.post(
    '/api/questionnaire/:professionalId/submit',
    [
        body('clientName')
            .notEmpty()
            .withMessage('Nome é obrigatório')
            .isString()
            .withMessage('Nome deve ser um texto'),
        body('clientEmail')
            .notEmpty()
            .withMessage('Email é obrigatório')
            .isEmail()
            .withMessage('Email inválido'),
        body('clientPhone')
            .notEmpty()
            .withMessage('Telefone é obrigatório')
            .isString()
            .withMessage('Telefone deve ser um texto'),
        body('clientCpf')
            .optional()
            .isString()
            .withMessage('CPF deve ser um texto'),
        body('clientBirthDate')
            .optional()
            .isISO8601()
            .withMessage('Data de nascimento inválida'),
        body('responses')
            .isArray()
            .withMessage('Respostas devem ser um array')
            .notEmpty()
            .withMessage('Respostas são obrigatórias'),
    ],
    validateRequest,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { professionalId } = req.params;
            const {
                clientName,
                clientEmail,
                clientPhone,
                clientCpf,
                clientBirthDate,
                clientGender,
                responses,
            } = req.body;

            // Verificar se profissional existe
            const profissional = await prisma.profissional.findUnique({
                where: { id: professionalId, ativo: true },
            });

            if (!profissional) {
                throw new NotFoundError('Profissional não encontrado');
            }

            // Verificar se cliente já existe pelo email
            let cliente = await prisma.cliente.findUnique({
                where: { email: clientEmail },
            });

            // Se não existir, criar novo cliente
            if (!cliente) {
                cliente = await prisma.cliente.create({
                    data: {
                        nome: clientName,
                        email: clientEmail,
                        telefone: clientPhone,
                        cpf: clientCpf || null,
                        dataNascimento: clientBirthDate ? new Date(clientBirthDate) : null,
                        genero: clientGender || null,
                        ativo: true,
                    },
                });
            }

            // Salvar respostas dos formulários
            const savedResponses = [];

            for (const response of responses) {
                const { questionnaireId, answers } = response;

                // Verificar se já existe resposta para este formulário
                const existingResponse = await prisma.respostaFormulario.findUnique({
                    where: {
                        formularioId_clienteId: {
                            formularioId: questionnaireId,
                            clienteId: cliente.id,
                        },
                    },
                });

                if (existingResponse) {
                    // Atualizar resposta existente
                    const updated = await prisma.respostaFormulario.update({
                        where: { id: existingResponse.id },
                        data: {
                            respostas: answers,
                            updatedAt: new Date(),
                        },
                    });
                    savedResponses.push(updated);
                } else {
                    // Criar nova resposta
                    const created = await prisma.respostaFormulario.create({
                        data: {
                            formularioId: questionnaireId,
                            clienteId: cliente.id,
                            respostas: answers,
                        },
                    });
                    savedResponses.push(created);
                }
            }

            res.status(201).json({
                success: true,
                message: 'Formulário enviado com sucesso!',
                data: {
                    clientId: cliente.id,
                    responsesCount: savedResponses.length,
                },
            });
        } catch (error) {
            next(error);
        }
    }
);

export { router as questionnaireRouter };