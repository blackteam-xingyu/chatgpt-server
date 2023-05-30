import Router from 'koa-router';
import Koa from 'koa';

const router = new Router();

router.get('/', async (ctx: Koa.Context) => {
  ctx.body = { code: 0, message: 'success', data: 'just a get test' };
});
router.post('/', async (ctx: Koa.Context) => {
  ctx.body = { code: 0, message: 'success', data: 'just a post test' };
});

export default router;
