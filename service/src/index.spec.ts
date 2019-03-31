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
});
