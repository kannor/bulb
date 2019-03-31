import * as Koa from 'koa';
import * as chai from 'chai';
import chaiHttp = require('chai-http');
import { Server } from 'http';

import server from './index';
import * as data from './data';

chai.use(chaiHttp);

const { expect, request } = chai;

describe('index', () => {
  let app: Server;

  before(() => {
    data.initialize();
    app = server().listen(4000);
  });

  after(() => {
    data.cleanup();
    app.close();
  });

  describe('GET /', () => {
    it('should say hello to the world', done => {
      request(app)
        .get('/')
        .end((_error, response) => {
          expect(response).to.have.status(200);
          expect(response.text).to.equal('Hello world');
          done();
        });
    });
  });

  describe('GET /meter-readings', () => {
    it('should return all meter readings', async () => {
      const expectedReadings = await data.all();

      request(app)
        .get('/meter-readings')
        .end((_error, response) => {
          expect(response).to.have.status(200);
          expect(response).to.be.json;
          expect(response.body).to.eql(expectedReadings);
        });
    });
  });

  describe('POST /meter-readings', () => {
    afterEach(() => {
      // tidy up data because tests are not running in transactions
      data.connection.run('DELETE FROM meter_reads WHERE cumulative = 42');
    });

    it('should create and store a new meter reading', async () => {
      const previousReadings = await data.all();
      const newReading = {
        cumulative: 42,
        readingDate: '2019-03-31T12:30:42.000Z',
        unit: 'kWh'
      };

      expect(previousReadings).not.to.contain(newReading);

      await request(app)
        .post('/meter-readings')
        .set('content-type', 'application/json')
        .send(newReading)
        .then(response => {
          expect(response).to.have.status(200);
        });

      const latestReadings = await data.all();

      expect(latestReadings.length).to.equal(previousReadings.length + 1);
    });
  });

  describe('GET /energy-usage', () => {
    it('should return the energy usage per month', done => {
      request(app)
        .get('/energy-usage')
        .end((_error, response) => {
          expect(response).to.have.status(200);
          expect(response.body).to.eql([
            { year: 2017, month: 3, usage: 211 },
            { year: 2017, month: 4, usage: 255.5 },
            { year: 2017, month: 5, usage: 225.5 },
            { year: 2017, month: 6, usage: 91.5 },
            { year: 2017, month: 7, usage: 167 },
            { year: 2017, month: 8, usage: 173.5 },
            { year: 2017, month: 9, usage: 234 },
            { year: 2017, month: 10, usage: 381 },
            { year: 2017, month: 11, usage: 258.5 },
            { year: 2017, month: 12, usage: 421.5 },
            { year: 2018, month: 1, usage: 259.5 },
            { year: 2018, month: 2, usage: 230 }
          ]);
          done();
        });
    });
  });
});
