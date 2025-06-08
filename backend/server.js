import Hapi from '@hapi/hapi';
import authRoutes from './routes/auth.js';
import dotenv from 'dotenv';
dotenv.config();

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: '0.0.0.0'
  });

  server.route(authRoutes);

  await server.start();
  console.log('Server running on', server.info.uri);
};

init();
