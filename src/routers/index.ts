import Router from 'koa-router';
const router = new Router();

import testRouter from './testRouter';
import sendRouter from './sendRouter';
testRouter(router);
sendRouter(router);

export default router;
