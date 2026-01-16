import request from 'supertest';
import jwt from 'jsonwebtoken';
import { faker } from '@faker-js/faker';

import Uuid from '@utils/Uuid';

import { app } from '@root/api/expressApp';

jest.mock('@root/generated/prisma', () => require('@mocks/prisma'));
import { mockUserFindFirst } from '@mocks/prisma';
import { IUserResponse } from '@routes/users/type';

test('Should return current user', async () => {
    const jwtPayload: IUserResponse = {
        id: faker.string.uuid() as Uuid,
        username: faker.string.alpha({ length: 10 }),
    };

    const token = jwt.sign(jwtPayload, process.env.JWT_SECRET!, {
        expiresIn: '7d',
    });

    mockUserFindFirst.mockResolvedValue(jwtPayload);

    const response = await request(app)
        .get(`/api/users/${jwtPayload.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send()
        .expect(200);

    expect(response.body).toStrictEqual(jwtPayload);
});

test('Should return NotFoundError', async () => {
    const jwtPayload: IUserResponse = {
        id: faker.string.uuid() as Uuid,
        username: faker.string.alpha({ length: 10 }),
    };

    const token = jwt.sign(jwtPayload, process.env.JWT_SECRET!, {
        expiresIn: '7d',
    });

    mockUserFindFirst.mockResolvedValue(null);

    const nonExistingUserId = faker.string.uuid();

    await request(app)
        .get(`/api/users/${nonExistingUserId}`)
        .set('Authorization', `Bearer ${token}`)
        .send()
        .expect(404);
});
