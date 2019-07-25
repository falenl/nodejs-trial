'use strict';

const request = require('supertest');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

const app = require('../src/app')(db);
const buildSchemas = require('../src/schemas');
const assert = require('assert');

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

    describe('GET /health', () => {
        it('should return health', (done) => {
            request(app)
                .get('/health')
                .expect('Content-Type', /text/)
                .expect(200, done);
        });
    });

    describe('POST /rides', () => {
      it('should return VALIDATION_ERROR: Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively', (done) => {
            request(app)
                .post('/rides')
                .send({
                    'start_lat': 101,
                    'start_long': 100,
                    'end_lat': 86,
                    'end_long': 120,
                    'rider_name': "super rider",
                    'driver_name': 'super driver',
                    'driver_vehicle': 'Honda Civic'
                })
                .expect('Content-Type', /json/)
                .expect(400, done);
        });

        it('should return VALIDATION_ERROR: End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively', (done) => {
              request(app)
                  .post('/rides')
                  .send({
                      'start_lat': 65,
                      'start_long': 120,
                      'end_lat': 201,
                      'end_long': 120,
                      'rider_name': 'super rider',
                      'driver_name': 'super driver',
                      'driver_vehicle': 'Honda Civic'
                  })
                  .expect('Content-Type', /json/)
                  .expect(400, done)
          });

          it('should return VALIDATION_ERROR: Rider name must be a non empty string', (done) => {
                request(app)
                    .post('/rides')
                    .send({
                        'start_lat': 65,
                        'start_long': 120,
                        'end_lat': 78,
                        'end_long': 120,
                        'rider_name': '',
                        'driver_name': 'super driver',
                        'driver_vehicle': 'Honda Civic'
                    })
                    .expect('Content-Type', /json/)
                    .expect(400, done)
            });
            it('should return VALIDATION_ERROR: Driver name must be a non empty string', (done) => {
                  request(app)
                      .post('/rides')
                      .send({
                          'start_lat': 65,
                          'start_long': 120,
                          'end_lat': 78,
                          'end_long': 120,
                          'rider_name': 'super rider',
                          'driver_name': '',
                          'driver_vehicle': 'Honda Civic'
                      })
                      .expect('Content-Type', /json/)
                      .expect(400, done)
              });
              it('should return VALIDATION_ERROR: Driver Vehicle must be a non empty string', (done) => {
                    request(app)
                        .post('/rides')
                        .send({
                            'start_lat': 65,
                            'start_long': 120,
                            'end_lat': 78,
                            'end_long': 120,
                            'rider_name': "super rider",
                            "driver_name": "super driver",
                            "driver_vehicle": ""
                        })
                        .expect('Content-Type', /json/)
                        .expect(400, done)
                });

                it('should return 200 for succesfully add rides', (done) => {
              request(app)
                  .post('/rides')
                  .send({
                    'start_lat': 65,
                    'start_long': 120,
                    'end_lat': 78,
                    'end_long': 120,
                    'rider_name': "super rider",
                    "driver_name": "super driver",
                    "driver_vehicle": "Honda Civic"
                  })
                  .expect('Content-Type', 'application/json; charset=utf-8')
                  .expect(200, done);
          });
    });

    describe('GET /rides', () => {
        it('should return rides', (done) => {
            request(app)
                .get('/rides')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it('pass start and limit, should return rides', (done) => {
            request(app)
                .get('/rides?start=1&limit=5')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it('pass start and limit, should return error', (done) => {
            request(app)
                .get('/rides?start=101&limit=100')
                .expect('Content-Type', /json/)
                .expect(404, done);
        });

        it('should return rides by id', (done) => {
            request(app)
                .get('/rides/1')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it('should return error', (done) => {
            request(app)
                .get('/rides/2')
                .expect('Content-Type', /json/)
                .expect(404, done);
        });
        it('sql injection test', (done) => {
            request(app)
                .get('/rides/2or1=1')
                .expect('Content-Type', /json/)
                .expect(404, done);
        });
    });
});
