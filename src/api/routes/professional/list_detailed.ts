import express, { NextFunction, Request, Response } from 'express';
import { query } from 'express-validator';

import { validateRequest } from '@root/api/middlewares';
import prisma from '@routes/common/prisma';

const router = express.Router();

router.get(
    '/api/profissional/public/detailed',
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
        query('ordenarPor')
            .optional()
            .isIn(['recente', 'nome', 'atendimentos'])
            .withMessage('ordenarPor must be recente, nome, or atendimentos'),
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
    async (req: Request, res:  Response, next: NextFunction) => {
        const {
            tipo,
            especialidade,
            search,
            ordenarPor = 'recente',
            page = '1',
            limit = '12',
        } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where:  any = {
            ativo:  true,
        };

        if (tipo) {
            where. tipo = tipo;
        }

        if (especialidade) {
            where.especialidade = {
                contains: especialidade as string,
                mode: 'insensitive',
            };
        }

        if (search) {
            where.OR = [
                { nome: { contains: search as string, mode: 'insensitive' } },
                { especialidade: { contains: search as string, mode: 'insensitive' } },
                { bio:  { contains: search as string, mode: 'insensitive' } },
            ];
        }

        // Definir ordenação
        let orderBy: any = { createdAt: 'desc' };
        if (ordenarPor === 'nome') {
            orderBy = { nome: 'asc' };
        }
        // Para ordenar por atendimentos, faremos depois da query

        const [profissionais, total] = await Promise.all([
            prisma.profissional. findMany({
                where,
                skip,
                take: limitNum,
                orderBy,
                select: {
                    id: true,
                    nome:  true,
                    email: true,
                    telefone: true,
                    tipo: true,
                    especialidade: true,
                    registro: true,
                    foto: true,
                    bio: true,
                    createdAt: true,
                    instagram: true,
                    linkedin: true,
                    whatsApp: true,
                    disponibilidades: {
                        where: {
                            ativo:  true,
                        },
                        select: {
                            id: true,
                            diaSemana: true,
                            horaInicio: true,
                            horaFim: true,
                        },
                        orderBy: {
                            diaSemana: 'asc',
                        },
                    },
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
            prisma.profissional.count({ where }),
        ]);

        // Formatar dados com informações extras
        let formattedData = profissionais.map((prof) => {
            // Agrupar disponibilidades por dia
            const diasDisponiveis = prof.disponibilidades.map((d) => ({
                dia: getDiaSemanaLabel(d.diaSemana),
                horaInicio: d.horaInicio,
                horaFim: d.horaFim,
            }));

            // Resumo de disponibilidade
            const resumoDisponibilidade = prof.disponibilidades.length > 0
                ? `${prof.disponibilidades.length} dia${prof.disponibilidades.length > 1 ? 's' :  ''} disponível${prof.disponibilidades.length > 1 ? 'eis' : ''}`
                : 'Sem disponibilidade';

            return {
                id: prof.id,
                nome: prof.nome,
                email: prof.email,
                telefone: prof.telefone,
                tipo: prof.tipo,
                tipoLabel: prof.tipo === 'NUTRICIONISTA' ?  'Nutricionista' :  'Psicólogo(a)',
                especialidade: prof.especialidade || 'Não informada',
                registro: prof.registro,
                foto: prof.foto || getDefaultAvatar(prof.tipo),
                bio: prof.bio || 'Sem descrição',
                bioResumo: prof.bio ?  truncateText(prof.bio, 150) : 'Sem descrição',
                createdAt: prof.createdAt,
                disponibilidades: diasDisponiveis,
                resumoDisponibilidade,
                temDisponibilidade: prof.disponibilidades.length > 0,
                totalAtendimentos: prof._count.agendamentos,
                instagram: prof.instagram || null,
                linkedin: prof.linkedin || null,
                whatsApp: prof.whatsApp || null,
                badges: {
                    novo: isNovoProfissional(prof. createdAt),
                    experiente: prof._count.agendamentos >= 50,
                    disponivel: prof. disponibilidades.length > 0,
                },
            };
        });

        // Ordenar por atendimentos se necessário
        if (ordenarPor === 'atendimentos') {
            formattedData = formattedData.sort((a, b) => b.totalAtendimentos - a. totalAtendimentos);
        }

        res.status(200).json({
            data: formattedData,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
            filters: {
                tipo: tipo || null,
                especialidade: especialidade || null,
                search: search || null,
                ordenarPor: ordenarPor || 'recente',
            },
            summary: {
                totalProfissionais: total,
                totalNutricionistas: await prisma.profissional.count({
                    where:  { ... where, tipo: 'NUTRICIONISTA' },
                }),
                totalPsicologos: await prisma.profissional.count({
                    where: { ...where, tipo: 'PSICOLOGO' },
                }),
            },
        });
    }
);

// Funções auxiliares
function getDiaSemanaLabel(dia: number): string {
    const dias = [
        'Domingo',
        'Segunda-feira',
        'Terça-feira',
        'Quarta-feira',
        'Quinta-feira',
        'Sexta-feira',
        'Sábado',
    ];
    return dias[dia] || 'Desconhecido';
}

function getDefaultAvatar(tipo: string): string {
    return tipo === 'NUTRICIONISTA'
        ? '/assets/default-nutricionista.png'
        : '/assets/default-psicologo.png';
}

function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

function isNovoProfissional(createdAt: Date): boolean {
    const diasCadastrado = Math.floor(
        (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return diasCadastrado <= 30; // Considera novo se cadastrou nos últimos 30 dias
}

export { router as listPublicDetailedProfissionalRouter };