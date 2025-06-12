import Hapi from '@hapi/hapi';
import routes from './routes.js';

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: '0.0.0.0',
  });

  await server.register(routes);
  await server.initialize();

  if (!process.env.VERCEL) {
    await server.start();
    console.log('Server running on %s', server.info.uri);
  }

  return server;
};

export default init;

export const handler = async (req, res) => {
  const server = await init();
  return server.listener(req, res);
};
