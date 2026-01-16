import packageInfo from '../package.json';
import { app as api } from './api/expressApp';

import './utils/dotenvLoader';

const serviceName = `${packageInfo.name}`;
const serviceDescription = `${serviceName} ${packageInfo.version}`;

if (!process.env.DATABASE_URL) {
    throw Error('DATABASE_URLis required.');
}

if (!process.env.JWT_SECRET) {
    throw Error('JWT_SECRET is required.');
}

const start = async () => {
    console.log(`Starting ${serviceDescription}...`);

    api.listen(process.env.API_BIND_PORT, () => {
        console.log(
            `${serviceName} listening on ${process.env.API_BIND_PORT}!`
        );
    });

    console.log(`${serviceName} started!`);
};

start();
