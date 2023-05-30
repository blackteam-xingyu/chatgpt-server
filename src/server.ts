import Koa from 'koa';
import cors from 'koa2-cors/dist';
import { koaBody } from 'koa-body';
import onerror from 'koa-onerror';
import jsonerror from 'koa-json-error';
import parameter from 'koa-parameter';
import Config from './utils/Config';
import router from './routers';

const app = new Koa();
onerror(app);
app.use(jsonerror());
app.use(parameter(app));
app.use(cors());
app.use(koaBody({ multipart: true }));
app.use(router.routes());
const port = Config.server?.port || 3030;
app.listen(port);

console.log(`Server running on port ${port}`);
