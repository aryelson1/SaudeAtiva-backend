import express, { Request, Response } from 'express';

import { authenticate, authorize, validateRequest } from '@root/api/middlewares';
import { NotFoundError } from '@root/api/errors';

import prisma from '@routes/common/prisma';

import { body } from 'express-validator';
import { IVehicleResponse } from './type';

const router = express.Router();

router.get(
    '/api/vehicles',
    authenticate,
    authorize('Read_Vehicle'),
    async (req: Request, res: Response<IVehicleResponse[]>) => {

        const userId = req.user?.id;

        if (!userId) {
            throw new NotFoundError('User not found');
        }

        const vehicleRows = await prisma.vehicle.findMany({
            where: {
                fleet: {
                    ...req.user?.contextFilter,
                }
            }
        });

        res.status(200).send(vehicleRows);
    }
);

router.get(
    '/api/vehicles/:id',
    authenticate,
    authorize('Read_Vehicle'),
    async (req: Request, res: Response<IVehicleResponse>) => {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            throw new NotFoundError('User not found');
        }
        
        const vehicleRow = await prisma.vehicle.findFirst({
            where: {
                id: id,
                fleet: {
                    ...req.user?.contextFilter,
                }
            },
            include: {
                device: true,
            }
        });

        if (!vehicleRow) {
            throw new NotFoundError('Vehicle not found');
        }

        res.status(200).send(vehicleRow);
    }
);

router.post(
    '/api/vehicles',
    [
        body('name')
            .notEmpty()
            .withMessage('name is required')
            .isString()
            .withMessage('name must be a string'),
        body('fleetId')
            .notEmpty()
            .withMessage('fleetId is required')
            .isUUID()
            .withMessage('fleetId must be a valid UUID'),
        body('type')
            .notEmpty()
            .withMessage('type is required')
            .isString()
            .withMessage('type must be a string'),
        body('deviceId')
            .notEmpty()
            .withMessage('deviceId is required')
            .isUUID()
            .withMessage('deviceId must be a valid UUID'),
    ],
    validateRequest,
    authenticate,
    authorize('Write_Vehicle'),
    async (req: Request, res: Response) => {
        const { name, type, fleetId, deviceId } = req.body;

        await prisma.vehicle.create({
            data: {
                name,
                type,
                fleet: fleetId ? { connect: { id: fleetId } } : undefined,
                device: deviceId ? { connect: { id: deviceId } } : undefined,
            },
        });
        res.status(201).send();
    }
);

export { router as indexVehicleRouter };
