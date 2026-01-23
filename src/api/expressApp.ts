import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cors from 'cors';
import compression from 'compression';

import { errorHandler } from './middlewares';

import { NotFoundError } from './errors';

import { createProfissionalRouter } from './routes/professional/create';
import { deleteProfissionalRouter } from './routes/professional/delete';
import { getProfissionalRouter } from './routes/professional/get';
import { listPublicDetailedProfissionalRouter } from './routes/professional/list_detailed';
import { listPublicProfissionalRouter } from './routes/professional/list_public';
import { updateProfissionalRouter } from './routes/professional/update';
import { loginProfissionalRouter } from './routes/professional/login';
import { getProfissionalDashboardRouter } from './routes/professional/dashboard/get';

const app = express();
app.use(json());
app.use(cors());
app.use(compression());

app.options('*', cors());

app.use(loginProfissionalRouter);
app.use(createProfissionalRouter);
app.use(deleteProfissionalRouter);
app.use(getProfissionalRouter);
app.use(listPublicDetailedProfissionalRouter);
app.use(listPublicProfissionalRouter);
app.use(updateProfissionalRouter);
app.use(getProfissionalDashboardRouter)

app.all('*', async () => {
    throw new NotFoundError('Route not found');
});

app.use(errorHandler);

export { app };
