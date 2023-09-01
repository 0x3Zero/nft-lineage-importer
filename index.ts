require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
console.log('\x1b[32m', `current env file: env.${process.env.NODE_ENV}`);

import express, { Express } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import cors from 'cors';
import flash from 'connect-flash';

import routes from './src/routes/v1';
// import { init as initRedis } from './src/database/redis';
// import { init as initWebSocket, upgrade as upgradeWebSocket } from './src/middlewares/web-socket.middleware';
import { initLogger } from './src/middlewares';
import http from 'http';
import { initDependencies } from './src/config';

const initServer = async () => {
  const app: Express = express();

  app.use(initLogger());

  app.set('trust proxy', true);

  app.use(bodyParser.json({ limit: '50mb' }));

  app.use(cookieParser());
  app.use(express.urlencoded({ extended: true }));
  app.use(flash());

  app.use(
    cors({
      origin: ['*'],
      methods: 'GET,POST,PATCH,DELETE',
    })
  );

  app.use('/api', routes);

  // await initRedis();
  const server = http.createServer(app);
  const port = process.env.PORT;
  // initWebSocket();

  initDependencies();

  server.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });

  // upgradeWebSocket(server);
};

initServer();
