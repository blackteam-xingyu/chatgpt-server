import Router from 'koa-router';

import testRouter from './testRouter';
import steamshipRouter from './steamshipRouter';
import openAIRouter from './openAIRouter';
import Config from '../utils/Config';
import { CHANNEL } from '../utils/Enum';

const router = new Router();

router.use('/test', testRouter.routes(), testRouter.allowedMethods());
if (Config.server.channel.length <= 0) {
  console.log('没有装载任何API仅"/text"接口可用');
} else {
  Config.server.channel.forEach((item: string) => {
    switch (item as CHANNEL) {
      case CHANNEL.STEAMSHIP:
        router.use('/steamship', steamshipRouter.routes(), steamshipRouter.allowedMethods());
        console.log('steamship已成功装载');
        break;
      case CHANNEL.OPENAI:
        router.use('/openai', openAIRouter.routes(), openAIRouter.allowedMethods());
        console.log('openAI已成功装载');
        break;
      default:
        break;
    }
  });
}

export default router;
