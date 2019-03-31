import * as Koa from 'koa';
import * as chai from 'chai';
import chaiHttp = require('chai-http');

import server from './index';
import { Server } from 'http';

chai.use(chaiHttp);

const { expect, request } = chai;

describe('index', () => {
  it('should create an instance of a Koa server', () => {
    const instance = server();
    expect(instance).to.be.instanceof(Koa);
  });

  describe('GET /', () => {
    let app: Server;

    beforeEach(() => {
      app = server().listen(3000);
    });

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
});
