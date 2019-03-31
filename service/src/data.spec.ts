import * as data from './data';
import { expect } from 'chai';
const sampleData = require('../sampleData.json');

describe('data', () => {
  before(() => {
    data.initialize();
  });

  after(() => {
    data.cleanup();
  });

  it('#initialize should import the data from the sampleData file', done => {
    data.connection.serialize(() => {
      data.connection.all(
        'SELECT * FROM meter_reads ORDER BY cumulative',
        (error, selectResult) => {
          expect(error).to.be.null;
          expect(selectResult).to.have.length(sampleData.electricity.length);
          selectResult.forEach((row, index) => {
            expect(row.cumulative).to.equal(
              sampleData.electricity[index].cumulative
            );
          });
          done();
        }
      );
    });
  });

  it('#all should return every meter reading stored as a promise', () => {
    data.all().then(meterReadings => {
      expect(meterReadings).to.have.length(sampleData.electricity.length);
      meterReadings.forEach((row, index) => {
        expect(row.cumulative).to.equal(
          sampleData.electricity[index].cumulative
        );
      });
    });
  });
});
