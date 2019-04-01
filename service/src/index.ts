import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import bodyParser = require('koa-bodyparser');

import * as db from './data';
import * as usage from './usage';

const PORT = process.env.PORT || 3000;

export default function createServer() {
  const server = new Koa();

  const router = new KoaRouter();
  router
    .use(bodyParser())
    .get('/', (ctx, next) => {
      ctx.body = 'Hello world';
      next();
    })
    .get('/energy-usage', async (ctx, next) => {
      try {
        const readings = await db.all();
        ctx.body = usage.calculate(readings);
      } catch (error) {
        ctx.throw(error, 400);
      }
      next();
    })
    .get('/meter-readings', async (ctx, next) => {
      try {
        ctx.body = await db.all();
      } catch (error) {
        ctx.throw(error, 400);
      }
      next();
    })
    .post('/meter-readings', async (ctx, next) => {
      const reading = ctx.request.body;
      try {
        ctx.body = await db.insert(reading);
      } catch (error) {
        ctx.throw(error, 400);
      }
      next();
    });

  server.use(router.allowedMethods());
  server.use(router.routes());

  return server;
}

if (!module.parent) {
  db.initialize();
  const server = createServer();
  server.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
  });
}
