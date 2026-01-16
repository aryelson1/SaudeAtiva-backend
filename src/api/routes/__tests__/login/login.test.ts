import request from 'supertest';
import { faker } from '@faker-js/faker';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import { app } from '@root/api/expressApp';

import Uuid from '@utils/Uuid';

jest.mock('@root/generated/prisma', () => require('@mocks/prisma'));
import { mockUserFindFirst } from '@mocks/prisma';
import { IUserResponse } from '@routes/users/type';

test("Should return user's token", async () => {
    const password = faker.string.alpha();

    const userCredentials: IUserResponse = {
        id: faker.string.uuid() as Uuid,
        username: faker.string.alpha(),
    };

    const mockUser: IUserResponse = {
        ...userCredentials,
        id: faker.string.uuid() as Uuid,
    };

    mockUserFindFirst.mockResolvedValue({
        ...mockUser,
        password: bcrypt.hashSync(password, 10),
    });

    const response = await request(app)
        .post('/api/login')
        .send({ username: userCredentials.username, password })
        .expect(200);

    const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET!);

    expect(decoded).toHaveProperty('id', mockUser.id);
    expect(decoded).toHaveProperty('username', mockUser.username);
});

test('Should return AuthenticationError', async () => {
    const password = faker.string.alpha();

    const userCredentials: IUserResponse = {
        id: faker.string.uuid() as Uuid,
        username: faker.string.alpha(),
    };

    mockUserFindFirst.mockResolvedValue(undefined);

    await request(app).post('/api/login').send({ username: userCredentials.username, password }).expect(401);
});
