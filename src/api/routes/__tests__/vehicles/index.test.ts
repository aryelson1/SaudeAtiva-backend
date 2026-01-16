import 'jest-extended';
import request from 'supertest';
import { faker } from '@faker-js/faker';
import jwt from 'jsonwebtoken';

import { app } from '@root/api/expressApp';

import Uuid from '@utils/Uuid';

const mockUserJwtPayload = {
    id: faker.string.uuid,
    username: faker.string.alpha(),
};
const token = jwt.sign(mockUserJwtPayload, process.env.JWT_SECRET!, {
    expiresIn: '7d',
});

jest.mock('@root/generated/prisma', () => {
    const { PrismaClient } = jest.requireActual('@mocks/prisma');
    const orginalPrisma = jest.requireActual('@root/generated/prisma');

    return {...orginalPrisma, PrismaClient };
});
import { mockVehicleFindFirst, mockVehicleFindMany } from '@mocks/prisma';
import { IVehicleResponse } from '@routes/vehicles/type';
import { VehicleType } from '@root/generated/prisma';

/// Route: /api/vehicles
test('Should return all vehicles', async () => {
    const vehicleId = faker.string.uuid() as Uuid;

    const vehicle: IVehicleResponse = {
        id: vehicleId,
        name: faker.string.alpha(),
        type: VehicleType.Mechanical,
        deviceId: faker.string.uuid(),
    };

    mockVehicleFindMany.mockResolvedValue([vehicle]);

    const response = await request(app)
        .get(`/api/vehicles`)
        .send()
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

    expect(response.body).toIncludeSameMembers([vehicle]);
});

test('Should return 200 OK if no vehicles are registered', async () => {
    mockVehicleFindMany.mockResolvedValue([]);

    await request(app)
        .get(`/api/vehicles`)
        .send()
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
});

test('Should return 401 Unauthorized if Bearer token is not passed', async () => {
    await request(app).get(`/api/vehicles`).send().expect(401);
});

/// Route: /api/vehicles/:id
test('Should return a vehicle with the specified id', async () => {
    const vehicleId = faker.string.uuid() as Uuid;

    const vehicle: IVehicleResponse = {
        id: vehicleId,
        name: faker.string.alpha(),
        type: VehicleType.Mechanical,
        deviceId: faker.string.uuid(),
    };

    mockVehicleFindFirst.mockResolvedValue(vehicle);

    const response = await request(app)
        .get(`/api/vehicles/${vehicleId}`)
        .send()
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

    expect(response.body).toEqual(vehicle);
});

test('Should return 404 Not Found if no vehicle matches the specified id', async () => {
    const vehicleId = faker.string.uuid() as Uuid;

    mockVehicleFindFirst.mockResolvedValue(undefined);

    await request(app)
        .get(`/api/vehicles/${vehicleId}`)
        .send()
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
});

test('Should return 401 Unauthorized if Bearer token is not passed', async () => {
    const vehicleId = faker.string.uuid() as Uuid;

    await request(app).get(`/api/vehicles/${vehicleId}`).send().expect(401);
});

/// Route: /api/vehicles (POST)
test('Should create a new vehicle', async () => {
    const vehicleId = faker.string.uuid() as Uuid;
    const vehicleName = faker.string.alpha();
    const vehicleType = VehicleType.Electric;
    const fleetId = faker.string.uuid() as Uuid;

    const vehicle: IVehicleResponse = {
        id: vehicleId,
        name: vehicleName,
        type: vehicleType,
        fleetId: fleetId,
        deviceId: faker.string.uuid(),
    };

    await request(app)
        .post(`/api/vehicles`)
        .send(vehicle)
        .set('Authorization', `Bearer ${token}`)
        .expect(201);
});

test('Should return 401 Unauthorized if Bearer token is not passed', async () => {
    await request(app)
        .post(`/api/vehicles`)
        .send({
            name: faker.string.alpha(),
            type: VehicleType.Mechanical,
            fleetId: faker.string.uuid() as Uuid,
            deviceId: faker.string.uuid(),
        })
        .expect(401);
});