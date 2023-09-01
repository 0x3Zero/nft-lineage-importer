import { Router } from 'express';

import nodeRoute from './node.route';

const router = Router();

const defaultRoutes = [
  {
    path: '/node',
    route: nodeRoute,
  },
];

defaultRoutes.forEach(route => {
  router.use(route.path, route.route);
});

export default router;
