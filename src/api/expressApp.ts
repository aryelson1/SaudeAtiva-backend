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
import { createProfissionalRouter } from './routes/professional/create';
import { deleteProfissionalRouter } from './routes/professional/delete';
import { getProfissionalRouter } from './routes/professional/get';
import { listPublicDetailedProfissionalRouter } from './routes/professional/list_detailed';
import { listPublicProfissionalRouter } from './routes/professional/list_public';
import { updateProfissionalRouter } from './routes/professional/update';

const app = express();
app.use(json());
app.use(cors());
app.use(compression());

app.options('*', cors());

app.use(indexVehicleRouter);
app.use(loginRouter);
app.use(updateUserRouter);
app.use(indexUsersRouter);
app.use(createProfissionalRouter);
app.use(deleteProfissionalRouter);
app.use(getProfissionalRouter);
app.use(listPublicDetailedProfissionalRouter);
app.use(listPublicProfissionalRouter);
app.use(updateProfissionalRouter);


app.all('*', async () => {
    throw new NotFoundError('Route not found');
});

app.use(errorHandler);

export { app };
