import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cors from 'cors';
import compression from 'compression';

import { errorHandler } from './middlewares';

import { NotFoundError } from './errors';

import { indexVehicleRouter } from './routes/vehicles';
import { loginRouter } from './routes/login/professional';
import { updateUserRouter } from './routes/users/update';
import { indexUsersRouter } from './routes/users';

const app = express();
app.use(json());
app.use(cors());
app.use(compression());

app.options('*', cors());

app.use(indexVehicleRouter);
app.use(loginRouter);
app.use(updateUserRouter);
app.use(indexUsersRouter);


app.all('*', async () => {
    throw new NotFoundError('Route not found');
});

app.use(errorHandler);

export { app };
