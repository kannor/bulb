import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import bodyParser = require('koa-bodyparser');
import * as moment from 'moment';

import * as db from './data';
import { isEndOfMonth } from './months';
import { monitorEventLoopDelay } from 'perf_hooks';

const PORT = process.env.PORT || 3000;

interface Usage {
  year: number;
  month: number;
  usage: number;
}

const mapUsage = (readings: db.MeterReading[]): Usage[] => {
  const monthlyUsage = [];

  const interpolated = interpolateReadings(readings);

  interpolated.forEach((_, index) => {
    if (index === 0) {
      return;
    }

    const { cumulative: nextCumulative } = interpolated[index];
    const { year, month, cumulative } = interpolated[index - 1];

    monthlyUsage[index - 1] = {
      year,
      month,
      usage: nextCumulative - cumulative
    };
  });

  return monthlyUsage;
};

const interpolateReadings = (readings: db.MeterReading[]): any[] => {
  const interpolated = [];

  let current: db.MeterReading;
  let date: moment.Moment;

  readings.forEach((next, index) => {
    current = readings[index - 1];
    if (Boolean(current)) {
      date = moment(current.readingDate);

      interpolated[index - 1] = {
        year: date.year(),
        month: date.month() + 1,
        cumulative: interpolateCumulative(date, current, next)
      };
    }
  });

  return interpolated;
};

const interpolateCumulative = (
  date: moment.Moment,
  current: db.MeterReading,
  next: db.MeterReading
): number => {
  if (isEndOfMonth(date)) {
    return current.cumulative;
  } else {
    return (next.cumulative - current.cumulative) / 2 + current.cumulative;
  }
};

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
        ctx.body = mapUsage(readings);
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
