import Hapi from '@hapi/hapi';
import authRoutes from './routes/auth.js';
import dotenv from 'dotenv';
dotenv.config();

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: 'localhost',
    routes: {
    cors: {
      origin: ['*'],
    },
  },
});

  server.route(authRoutes);

  await server.start();
  console.log('Server running on', server.info.uri);
};

init();
