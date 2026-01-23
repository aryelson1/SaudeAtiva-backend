import express, { Request, Response, NextFunction } from 'express';
import { param } from 'express-validator';

import { validateRequest, authenticate } from '@root/api/middlewares';
import prisma from '@routes/common/prisma';

const router = express.Router();

router.get(
    '/api/profissional/:id/dashboard',
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

        // Busca tipo do profissional
        const profissional = await prisma.profissional.findUnique({
            where: { id },
            select: {
                id: true,
                nome: true,
                tipo: true,
                ativo: true,
            },
        });

        if (!profissional) {
            res.status(404).json({
                errors: [{ message: 'Profissional não encontrado' }],
            });
            return;
        }

        // =========================
        // BASE COMUM
        // =========================

        const hojeInicio = new Date();
        hojeInicio.setHours(0, 0, 0, 0);

        const hojeFim = new Date();
        hojeFim.setHours(23, 59, 59, 999);

        const agendamentosHoje = await prisma.agendamento.count({
            where: {
                profissionalId: id,
                dataHora: {
                    gte: hojeInicio,
                    lte: hojeFim,
                },
            },
        });

        const faturamentoMes = await prisma.agendamento.aggregate({
            where: {
                profissionalId: id,
                status: 'CONCLUIDO',
            },
            _sum: {
                valor: true,
            },
        });

        const baseDashboard = {
            agendamentosHoje,
            faturamentoMes: faturamentoMes._sum.valor || 0,
        };

        console.log('Base Dashboard:', baseDashboard);
        
        // =========================
        // NUTRICIONISTA
        // =========================

        if (profissional.tipo === 'NUTRICIONISTA') {

            const evolucoesRecentes = await prisma.evolucao.findMany({
                where: {
                    prontuario: {
                        profissionalId: id,
                    },
                },
                orderBy: {
                    data: 'desc',
                },
                take: 5,
            });

            res.status(200).json({
                profissional,
                ...baseDashboard,
                evolucoesRecentes,
            });

            return;
        }

        // =========================
        // PSICÓLOGO
        // =========================

        if (profissional.tipo === 'PSICOLOGO') {

            const sessoesRealizadas = await prisma.agendamento.count({
                where: {
                    profissionalId: id,
                    status: 'CONCLUIDO',
                },
            });

            res.status(200).json({
                profissional,
                ...baseDashboard,
                sessoesRealizadas,
            });

            return;
        }
    }
);

export { router as getProfissionalDashboardRouter };
