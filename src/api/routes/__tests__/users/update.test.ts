import request from 'supertest';
import jwt from 'jsonwebtoken';
import { faker } from '@faker-js/faker';

import Uuid from '@utils/Uuid';

import { app } from '@root/api/expressApp';

jest.mock('@root/generated/prisma', () => require('@mocks/prisma'));
import { mockUserFindFirst } from '@mocks/prisma';
import { IUserResponse } from '@routes/users/type';

test("Should update a user's password", async () => {
    const jwtPayload: IUserResponse = {
        id: faker.string.uuid() as Uuid,
        username: faker.string.alpha({ length: 10 }),
    };

    const token = jwt.sign(jwtPayload, process.env.JWT_SECRET!, {
        expiresIn: '7d',
    });

    const newPassword = 'new_password';

    mockUserFindFirst.mockResolvedValue(jwtPayload);

    await request(app)
        .put(`/api/users/${jwtPayload.id}/password`)
        .set('Authorization', `Bearer ${token}`)
        .send({ newPassword })
        .expect(204);
});

test('Should return PermissionError', async () => {
    const jwtPayload: IUserResponse = {
        id: faker.string.uuid() as Uuid,
        username: faker.string.alpha({ length: 10 }),
    };

    const token = jwt.sign(jwtPayload, process.env.JWT_SECRET!, {
        expiresIn: '7d',
    });

    const newPassword = 'new_password';

    const anotherUserId = faker.string.uuid();

    await request(app)
        .put(`/api/users/${anotherUserId}/password`)
        .set('Authorization', `Bearer ${token}`)
        .send({ newPassword })
        .expect(403);
});
