import Hapi from '@hapi/hapi';
import dotenv from 'dotenv';
import { routes } from './routes.js';
dotenv.config();

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: 'localhost',
    routes: {
    cors: {
      origin: ['https://capstone-dbs-skinalyze.vercel.app'],
      credentials: true,
    },
  },
});

  server.route(routes);

  await server.start();
  console.log('Server running on', server.info.uri);
};

init();
