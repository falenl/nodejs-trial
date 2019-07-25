'use strict';

const request = require('supertest');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');
const db2 = new sqlite3.Database(':memory:');

const connector = require('../src/connector')(db);
const connector2 = require('../src/connector')(db2);
const buildSchemas = require('../src/schemas');
const assert = require('chai').assert;

describe('API tests', () => {
  before((done) => {
      db.serialize((err) => {
          if (err) {
              return done(err);
          }

          buildSchemas(db);

          done();
      });
  });
  describe('Negative Test Case', () => {
      it('Add Ride', (done) => {
          connector.addRide([65,120,201,'super rider', 'super driver', 'Honda Civic'])
          .catch((err) => {
            assert.isNotNull(err);
            done();
          })
      });

      it('getTotalRides', (done) => {
          connector2.getTotalRides()
          .catch((err) => {
            assert.isNotNull(err);
            done();
          })
      });

      it('getAllRides', (done) => {
          connector2.getAllRides()
          .catch((err) => {
            assert.isNotNull(err);
            done();
          })
      });

      it('getRideById', (done) => {
          connector2.getRideById("1")
          .catch((err) => {
            assert.isNotNull(err);
            done();
          })
      });
  });

  describe('Positive Test Case', () => {
      it('Add Ride', (done) => {
          connector.addRide([65,120,201,20, "super 'rider", 'super driver', 'Honda Civic'])
          .then((lastId) => {
            assert.isNotNull(lastId);
            assert.equal(lastId, 1);
            done();
          })
      });

      it('getAllRides', (done) => {
          connector.getAllRides()
          .then((rows) => {
            assert.isNotNull(rows);
            assert.equal(rows.length, 1);
            done();
          })
      });

      it('getTotalRides', (done) => {
          connector.getTotalRides()
          .then((total) => {
            assert.isNotNull(total);
            assert.equal(1, total, "Total is different");
            done();
          })
      });

      it('getRideById', (done) => {
          connector.getRideById(1)
          .then((rows) => {
            assert.isNotNull(rows);
            assert.equal(rows.length, 1);
            done();
          })
      });

      it('get Total 0', (done) => {
        db2.serialize((err) => {
            if (err) {
                return done(err);
            }

            buildSchemas(db2);

            connector2.getTotalRides()
            .then((total) => {
              assert.isNotNull(total);
              assert.equal(0, total, "Total is different");
              done();
            })
        });
      });
  });
});
