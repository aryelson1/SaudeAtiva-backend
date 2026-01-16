import express, { NextFunction, Request, Response } from 'express';
import { query } from 'express-validator';

import { validateRequest } from '@root/api/middlewares';
import prisma from '@routes/common/prisma';

const router = express.Router();

router.get(
    '/api/profissional/public',
    [
        query('tipo')
            .optional()
            .isIn(['NUTRICIONISTA', 'PSICOLOGO'])
            .withMessage('tipo must be NUTRICIONISTA or PSICOLOGO'),
        query('especialidade')
            .optional()
            .isString()
            .withMessage('especialidade must be a string'),
        query('search')
            .optional()
            .isString()
            .withMessage('search must be a string'),
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('page must be a positive integer'),
        query('limit')
            .optional()
            .isInt({ min: 1, max: 50 })
            .withMessage('limit must be between 1 and 50'),
    ],
    validateRequest,
    async (req: Request, res: Response, next: NextFunction) => {
        const {
            tipo,
            especialidade,
            search,
            page = '1',
            limit = '12',
        } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where:  any = {
            ativo: true, // Só mostrar profissionais ativos
        };

        // Filtrar por tipo (Nutricionista ou Psicólogo)
        if (tipo) {
            where.tipo = tipo;
        }

        // Filtrar por especialidade
        if (especialidade) {
            where.especialidade = {
                contains: especialidade as string,
                mode: 'insensitive',
            };
        }

        // Busca por nome ou especialidade
        if (search) {
            where.OR = [
                { nome: { contains: search as string, mode: 'insensitive' } },
                { especialidade: { contains: search as string, mode: 'insensitive' } },
                { bio: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        const [profissionais, total] = await Promise.all([
            prisma. profissional.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: {
                    createdAt: 'desc',
                },
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    telefone: true,
                    tipo: true,
                    especialidade: true,
                    registro: true,
                    foto: true,
                    bio:  true,
                    createdAt: true,
                    // Incluir disponibilidades
                    disponibilidades: {
                        where:  {
                            ativo: true,
                        },
                        select: {
                            id:  true,
                            diaSemana: true,
                            horaInicio: true,
                            horaFim: true,
                        },
                        orderBy: {
                            diaSemana: 'asc',
                        },
                    },
                    // Contar agendamentos
                    _count: {
                        select:  {
                            agendamentos:  {
                                where: {
                                    status: 'CONCLUIDO',
                                },
                            },
                        },
                    },
                },
            }),
            prisma.profissional. count({ where }),
        ]);

        // Formatar os dados para a tela inicial
        const formattedData = profissionais.map((prof) => ({
            id: prof.id,
            nome: prof.nome,
            email: prof.email,
            telefone: prof.telefone,
            tipo: prof.tipo,
            especialidade: prof.especialidade,
            registro: prof.registro,
            foto: prof.foto,
            bio: prof.bio,
            createdAt: prof.createdAt,
            disponibilidades: prof.disponibilidades,
            totalAtendimentos: prof._count.agendamentos,
            temDisponibilidade: prof.disponibilidades. length > 0,
        }));

        res.status(200).json({
            data: formattedData,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
            filters: {
                tipo:  tipo || null,
                especialidade: especialidade || null,
                search: search || null,
            },
        });
    }
);

export { router as listPublicProfissionalRouter };