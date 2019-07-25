"use strict";

const express = require("express");
const app = express();
const helmet = require("helmet");

const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const connector = require("./connector");
const util = require("./util")();

module.exports = (db) => {
    const ride = connector(db);
    app.use(helmet());
    app.get("/health", (req, res) => res.send("Healthy"));

    /**
     * @api {post} /rides Create New Ride
     * @apiName Rides
     * @apiGroup Rides
     * @apiVersion 1.0.0
     * @apiParam {String} startLat  Start latitude of the Ride.
     * @apiParam {String} startLong Start longitude of the Ride.
     * @apiParam {String} endLat  End latitude of the Ride.
     * @apiParam {String} endLong End longitude of the Ride.
     * @apiParam {String} riderName  Name of the rider.
     * @apiParam {String} driverName Name of the driver.
     * @apiParam {String} driverVehicle  Vehicle.
     * @apiParam {String} created Create datetime.
     *
     * @apiSuccess {Number} rideID Id of the Ride.
     * @apiSuccess {String} startLat  Start latitude of the Ride.
     * @apiSuccess {String} startLong Start longitude of the Ride.
     * @apiSuccess {String} endLat  End latitude of the Ride.
     * @apiSuccess {String} endLong End longitude of the Ride.
     * @apiSuccess {String} riderName  Name of the rider.
     * @apiSuccess {String} driverName Name of the driver.
     * @apiSuccess {String} driverVehicle  Vehicle.
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     [{
     *       "rideID": 1,
     *       "startLat": "1232323.32",
     *       "startLong": "233434.32",
     *       "endLat": "4334344.32",
     *       "endLong": "34343443.32",
     *       "riderName": "Kamen Rider",
     *       "driverName": "Naruto",
     *       "driverVehicle": "Naruto",
     *       "created": "2016-02-03 17:51:28",
     *     }]
     *
     * @apiError VALIDATION_ERROR Some validation error.
     *
     * @apiErrorExample Error-start-latitude:
     *     HTTP/1.1 404
     *     {
     *       "error_code": 'VALIDATION_ERROR',
     *       "message": 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
     *     }
     * @apiErrorExample Error-end-latitude:
     *     HTTP/1.1 404
     *     {
     *       "error_code": 'VALIDATION_ERROR',
     *       "message": 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
     *     }
     * @apiErrorExample Error-empty rider name:
     *     HTTP/1.1 404
     *     {
     *       "error_code": 'VALIDATION_ERROR',
     *       "message": 'Rider name must be a non empty string'
     *     }
     * @apiErrorExample Error-empty rider name:
     *     HTTP/1.1 404
     *     {
     *       "error_code": 'VALIDATION_ERROR',
     *       "message": 'Driver name must be a non empty string'
     *     }
     * @apiErrorExample Error-empty rider name:
     *     HTTP/1.1 404
     *     {
     *       "error_code": 'VALIDATION_ERROR',
     *       "message": 'Driver Vehicle must be a non empty string'
     *     }
     * @apiError (ERR 5xx) SERVER_ERROR Unknown error.
     *
     * @apiErrorExample Error-500:
     *     HTTP/1.1 500 Unknown error
     *     {
     *       "error_code": 'SERVER_ERROR',
     *       "message": 'Unknown error'
     *     }
     */

    app.post("/rides", jsonParser, async(req, res) => {
        const startLatitude = Number(req.body.start_lat);
        const startLongitude = Number(req.body.start_long);
        const endLatitude = Number(req.body.end_lat);
        const endLongitude = Number(req.body.end_long);
        const riderName = req.body.rider_name;
        const driverName = req.body.driver_name;
        const driverVehicle = req.body.driver_vehicle;

        util.logInfo("Calling POST /rides started - Request:" + JSON.stringify(endLatitude));

        if (!startLatitude || !startLongitude || startLatitude < -90 || startLatitude > 90 || startLongitude < -180 || startLongitude > 180) {
            util.logInfo("VALIDATION_ERROR: Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively");
            return res.status(400).send({
                error_code: "VALIDATION_ERROR",
                message: "Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively"
            });
        }

        if (!endLatitude || !endLongitude || endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
          util.logInfo("VALIDATION_ERROR: End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively");
            return res.status(400).send({
                error_code: "VALIDATION_ERROR",
                message: "End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively"
            });
        }

        if (typeof riderName !== "string" || riderName.length < 1) {
          util.logInfo("VALIDATION_ERROR: Rider name must be a non empty string");
            return res.status(400).send({
                error_code: "VALIDATION_ERROR",
                message: "Rider name must be a non empty string"
            });
        }

        if (typeof driverName !== "string" || driverName.length < 1) {
          util.logInfo("VALIDATION_ERROR: Driver name must be a non empty string");
            return res.status(400).send({
                error_code: "VALIDATION_ERROR",
                message: "Driver name must be a non empty string"
            });
        }

        if (typeof driverVehicle !== "string" || driverVehicle.length < 1) {
          util.logInfo("VALIDATION_ERROR: Driver Vehicle must be a non empty string");
            return res.status(400).send({
                error_code: "VALIDATION_ERROR",
                message: "Driver Vehicle must be a non empty string"
            });
        }

        var values = [req.body.start_lat, req.body.start_long, req.body.end_lat, req.body.end_long, req.body.rider_name, req.body.driver_name, req.body.driver_vehicle];

        try{
          let lastId = await ride.addRide(values);
          let row = await ride.getRideById(lastId);
          res.send(row);
          util.logInfo("Calling POST /rides finished - response: " + JSON.stringify(row));

        }catch(error){
          util.logError("SERVER_ERROR : Unknown error");
          return res.status(500).send({
              error_code: "SERVER_ERROR",
              message: "Unknown error"
          });
        }
    });

    /**
     * @api {get} /rides Request All Rides information
     * @apiName GetRides
     * @apiGroup Rides
     * @apiVersion 1.0.0
     * @apiParam {Number} [start=1] used for pagination get from previous call.
     * @apiParam {Number} [limit=100] limit returned data.
     * @apiParamExample {String} Request-Example:
     *     /rides?start=101&limit=100
     *
     * @apiSuccess {Number} [next] The next page of start id from.
     * @apiSuccess {Number} limit limit data returned.
     * @apiSuccess {Object} ride object of ride
     * @apiSuccess (ride) {Number} rideID Id of the Ride.
     * @apiSuccess (ride) {String} startLat  Start latitude of the Ride.
     * @apiSuccess (ride) {String} startLong Start longitude of the Ride.
     * @apiSuccess (ride) {String} endLat  End latitude of the Ride.
     * @apiSuccess (ride) {String} endLong End longitude of the Ride.
     * @apiSuccess (ride) {String} riderName  Name of the rider.
     * @apiSuccess (ride) {String} driverName Name of the driver.
     * @apiSuccess (ride) {String} driverVehicle  Vehicle.
     * @apiSuccess (ride) {String} created Create datetime.
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *      "next": 101,
     *      "limit": 100,
     *      "ride": [{
     *        "rideID": 1,
     *        "startLat": "1232323.32",
     *        "startLong": "233434.32",
     *        "endLat": "4334344.32",
     *        "endLong": "34343443.32",
     *        "riderName": "Kamen Rider",
     *        "driverName": "Naruto",
     *        "driverVehicle": "Naruto",
     *        "created": "2016-02-03 17:51:28",
     *      }]
     *     }
     *
     * @apiError RIDES_NOT_FOUND_ERROR Could not find any rides.
     *
     * @apiErrorExample Error-404:
     *     HTTP/1.1 404
     *     {
     *       "error_code": 'RIDES_NOT_FOUND_ERROR',
     *       "message": 'Could not find any rides'
     *     }
     * @apiError (ERR 5xx) SERVER_ERROR Unknown error.
     *
     * @apiErrorExample Error-500:
     *     HTTP/1.1 500 Unknown error
     *     {
     *       "error_code": 'SERVER_ERROR',
     *       "message": 'Unknown error'
     *     }
     */

     app.get("/rides", async(req, res) => {
       let start = Number(req.query.start) || 1;
       let limit = Number(req.query.limit) || 100;
       let str = JSON.stringify(req.query) || "";

       util.logInfo("Calling GET /rides started - Request: " + str);

       try{
         let total = await ride.getTotalRides();
         let rows = await ride.getAllRides(start, limit);

         if (rows.length === 0) {
           util.logInfo("RIDES_NOT_FOUND_ERROR : Could not find any rides");

           return res.status(404).send({
             error_code: "RIDES_NOT_FOUND_ERROR",
             message: "Could not find any rides"
           });
         }

         let next = start + limit;
         let result = {};
         if (total > next){
           result["next"] = next;
         }

         result["limit"] = limit;
         result["ride"] = rows;

         res.send(result);
         util.logInfo("Calling GET /rides finished - Response: " + JSON.stringify(result));

       }catch(error){
         util.logError("SERVER_ERROR : Unknown error");
         return res.status(500).send({
           error_code: "SERVER_ERROR",
           message: "Unknown error"
         });
       }
     });

/**
 * @api {get} /rides/:id Request Ride information
 * @apiName GetRidesById
 * @apiGroup Rides
 * @apiVersion 1.0.0
 * @apiParam {Number} id Ride unique ID.
 *
 * @apiSuccess {Number} rideID Id of the Ride.
 * @apiSuccess {String} startLat  Start latitude of the Ride.
 * @apiSuccess {String} startLong Start longitude of the Ride.
 * @apiSuccess {String} endLat  End latitude of the Ride.
 * @apiSuccess {String} endLong End longitude of the Ride.
 * @apiSuccess {String} riderName  Name of the rider.
 * @apiSuccess {String} driverName Name of the driver.
 * @apiSuccess {String} driverVehicle  Vehicle.
 * @apiSuccess {String} created Create datetime.
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     [{
 *       "rideID": 1,
 *       "startLat": "1232323.32",
 *       "startLong": "233434.32",
 *       "endLat": "4334344.32",
 *       "endLong": "34343443.32",
 *       "riderName": "Kamen Rider",
 *       "driverName": "Naruto",
 *       "driverVehicle": "Naruto",
 *       "created": "2016-02-03 17:51:28",
 *     }]
 *
 * @apiError RIDES_NOT_FOUND_ERROR Could not find any rides.
 *
 * @apiErrorExample Error-404:
 *     HTTP/1.1 404
 *     {
 *       "error_code": 'RIDES_NOT_FOUND_ERROR',
 *       "message": 'Could not find any rides'
 *     }
 * @apiError (ERR 5xx) SERVER_ERROR Unknown error.
 *
 * @apiErrorExample Error-500:
 *     HTTP/1.1 500 Unknown error
 *     {
   *       "error_code": 'SERVER_ERROR',
   *       "message": 'Unknown error'
   *     }
   */
   app.get("/rides/:id", async(req, res) => {
     try{
       util.logInfo(`Calling GET /rides/${req.params.id} started`);
       if (isNaN(req.params.id)) {
         return res.status(404).send({
           error_code: "VALIDATION_ERROR",
           message: "Bad Request of Id"
         });
       }

       let row = await ride.getRideById(req.params.id);
       if (row.length === 0) {
         util.logInfo("RIDES_NOT_FOUND_ERROR: Could not find any rides");
         return res.status(404).send({
           error_code: "RIDES_NOT_FOUND_ERROR",
           message: "Could not find any rides"
         });
       }else {
         util.logInfo(`Calling GET /rides/${req.params.id} finished - response: ` + JSON.stringify(row));
         res.send(row);
       }
     }catch(error){
       util.logError("SERVER_ERROR : Unknown error");

       return res.status(500).send({
         error_code: "SERVER_ERROR",
         message: "Unknown error"
       });
     }
   });

    app.use("/apidoc", express.static("apidoc"));

    return app;
};
