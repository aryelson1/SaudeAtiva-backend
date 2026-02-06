import express, { NextFunction, Request, Response } from 'express';
import { authenticate, UserJwtPayload } from '@root/api/middlewares/authenticate';
import prisma from '@routes/common/prisma';
import { NotFoundError } from '@root/api/errors';
import { startOfDay, endOfDay, addDays } from 'date-fns';

const router = express.Router();

router.get(
    '/api/professionals/dashboard',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = req.user;
            const profissionalId = user?.id;

            // Verifica se o profissional existe
            const profissional = await prisma.profissional.findUnique({
                where: { id: profissionalId },
            });

            if (!profissional) {
                throw new NotFoundError('Profissional não encontrado');
            }

            // Data de hoje
            const hoje = new Date();
            const inicioDia = startOfDay(hoje);
            const fimDia = endOfDay(hoje);
            const proximos7Dias = addDays(hoje, 7);

            // 1. Total de clientes únicos
            const totalClients = await prisma.agendamento.groupBy({
                by: ['clienteId'],
                where: {
                    profissionalId,
                },
            });

            // 2. Total de agendamentos
            const totalAppointments = await prisma.agendamento.count({
                where: {
                    profissionalId,
                },
            });

            // 3. Agendamentos concluídos
            const completedAppointments = await prisma.agendamento.count({
                where: {
                    profissionalId,
                    status: 'CONCLUIDO',
                },
            });

            // 4. Agendamentos pendentes
            const pendingAppointments = await prisma.agendamento.count({
                where: {
                    profissionalId,
                    status: {
                        in: ['PENDENTE', 'CONFIRMADO'],
                    },
                    dataHora: {
                        gte: hoje,
                    },
                },
            });

            // 5. Agendamentos de hoje
            const todayAppointmentsCount = await prisma.agendamento.count({
                where: {
                    profissionalId,
                    dataHora: {
                        gte: inicioDia,
                        lte: fimDia,
                    },
                },
            });

            // 6. Formulários pendentes de resposta
            const formulariosPendentes = await prisma.formulario.count({
                where: {
                    profissionalId,
                    ativo: true,
                    respostas: {
                        none: {},
                    },
                },
            });

            // 7. Buscar agendamentos de hoje com detalhes
            const todayAppointments = await prisma.agendamento.findMany({
                where: {
                    profissionalId,
                    dataHora: {
                        gte: inicioDia,
                        lte: fimDia,
                    },
                },
                include: {
                    cliente: {
                        select: {
                            id: true,
                            nome: true,
                            foto: true,
                            telefone: true,
                        },
                    },
                },
                orderBy: {
                    dataHora: 'asc',
                },
            });

            // 8. Próximos agendamentos (7 dias)
            const upcomingAppointments = await prisma.agendamento.findMany({
                where: {
                    profissionalId,
                    dataHora: {
                        gt: fimDia,
                        lte: proximos7Dias,
                    },
                    status: {
                        in: ['PENDENTE', 'CONFIRMADO'],
                    },
                },
                include: {
                    cliente: {
                        select: {
                            id: true,
                            nome: true,
                            foto: true,
                            telefone: true,
                        },
                    },
                },
                orderBy: {
                    dataHora: 'asc',
                },
                take: 10,
            });

            // 9. Clientes recentes (últimos 5)
            const recentClients = await prisma.cliente.findMany({
                where: {
                    agendamentos: {
                        some: {
                            profissionalId,
                        },
                    },
                },
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    telefone: true,
                    foto: true,
                    createdAt: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: 5,
            });

            // Formatar dados para o frontend
            const formattedTodayAppointments = todayAppointments.map((apt) => ({
                id: apt.id,
                date: apt.dataHora.toISOString(),
                isOnline: apt.tipo === 'ONLINE',
                status: getStatusLabel(apt.status),
                client: {
                    name: apt.cliente.nome,
                    photo: apt.cliente.foto,
                },
            }));

            const formattedUpcomingAppointments = upcomingAppointments.map((apt) => ({
                id: apt.id,
                date: apt.dataHora.toISOString(),
                isOnline: apt.tipo === 'ONLINE',
                status: getStatusLabel(apt.status),
                client: {
                    name: apt.cliente.nome,
                    photo: apt.cliente.foto,
                },
            }));

            const formattedRecentClients = recentClients.map((client) => ({
                name: client.nome,
                email: client.email,
                phone: client.telefone,
                photo: client.foto,
                createdAt: client.createdAt.toISOString(),
            }));

            // Resposta final
            res.status(200).json({
                success: true,
                data: {
                    stats: {
                        totalClients: totalClients.length,
                        totalAppointments,
                        completedAppointments,
                        pendingAppointments,
                        todayAppointments: todayAppointmentsCount,
                        pendingQuestionnaires: formulariosPendentes,
                    },
                    todayAppointments: formattedTodayAppointments,
                    upcomingAppointments: formattedUpcomingAppointments,
                    recentClients: formattedRecentClients,
                    pendingQuestionnaires: [],
                },
            });
        } catch (error) {
            next(error);
        }
    }
);

// Função auxiliar para traduzir status
function getStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
        PENDENTE: 'Agendado',
        CONFIRMADO: 'Confirmado',
        CONCLUIDO: 'Realizado',
        CANCELADO: 'Cancelado',
        NAO_COMPARECEU: 'Não Compareceu',
    };
    return statusMap[status] || status;
}

export { router as dashboardRouter };