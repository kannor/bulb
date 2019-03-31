import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import * as db from './data';

const PORT = process.env.PORT || 3000;

export default function createServer() {
  const server = new Koa();

  const router = new KoaRouter();
  router
    .get('/', (ctx, next) => {
      ctx.body = 'Hello world';
      next();
    })
    .get('/meter-readings', async (ctx, next) => {
      try {
        ctx.body = await db.all();
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
