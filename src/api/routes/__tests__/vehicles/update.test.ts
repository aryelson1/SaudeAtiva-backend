import request from 'supertest';
import { faker } from '@faker-js/faker';
import jwt from 'jsonwebtoken';


import { app } from '@root/api/expressApp';

jest.mock('@root/generated/prisma', () => {
    const { PrismaClient } = jest.requireActual('@mocks/prisma');
    const orginalPrisma = jest.requireActual('@root/generated/prisma');

    return {...orginalPrisma, PrismaClient };
});
jest.mock('@root/api/middlewares/authorize', () => ({
    authorize: () => (req: any, res: any, next: any) => {
        return next();
    },
}));
jest.mock('@root/api/middlewares/authorizeFleetContext', () => ({
    authorizeFleetContext: () => (req: any, res: any, next: any) => {
        return next();
    },
}));
import { mockVehicleFindFirst } from '@mocks/prisma';
import { VehicleType } from '@root/generated/prisma';
import { IVehicleResponse } from '@routes/vehicles/type';

const mockUserJwtPayload = {
    id: faker.string.uuid,
    username: faker.string.alpha(),
};
const token = jwt.sign(mockUserJwtPayload, process.env.JWT_SECRET!, {
    expiresIn: '7d',
});


test("Should update a vehicle's device", async () => {
    const vehicleId = faker.string.uuid();
    const deviceId = faker.string.uuid();
    const name = faker.vehicle.model();
    const fleetId = faker.string.uuid();

    const vehicle: IVehicleResponse = {
        id: vehicleId,
        name: faker.string.alpha(),
        type: VehicleType.Mechanical,
        deviceId: faker.string.uuid(),
    };

    mockVehicleFindFirst.mockResolvedValue([vehicle]);

    await request(app)
        .put(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ deviceId, name, fleetId })
        .expect(204);
});

test("Should update a vehicle's name", async () => {
    const vehicleId = faker.string.uuid();
    const name = faker.vehicle.model();
    const vehicle: IVehicleResponse = {
        id: vehicleId,
        name: faker.string.alpha(),
        type: VehicleType.Mechanical,
        deviceId: faker.string.uuid(),
    };
    mockVehicleFindFirst.mockResolvedValue([vehicle]);

    await request(app)
        .put(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name })
        .expect(204);
});

test('Should return NotFoundError', async () => {
    const vehicleId = faker.string.uuid();
    const deviceId = faker.string.uuid();
    const name = faker.vehicle.model();
    const fleetId = faker.string.uuid();

    mockVehicleFindFirst.mockResolvedValue(null);

    await request(app)
        .put(`/api/vehicles/${vehicleId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ deviceId, name, fleetId})
        .expect(404);
});