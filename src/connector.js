module.exports = (db) => {

  const addRide = (params) => {
    let sql = "INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)";
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err){
          reject(err);
        }else {
          resolve(this.lastID);
        }
      });
    });
  };

  const getAllRides = (start, limit) => {
    const startPage = start || 1;
    const limitResults = limit || 100;

    let sql = "SELECT * FROM Rides WHERE rideId >= ? ORDER BY rideId LIMIT ?";

    return new Promise((resolve, reject) => {
      db.all(sql, [startPage, limitResults], (err, rows) => {
        if (err) {
          reject(err);
        }

        resolve(rows);
      });
    });
  };

  const getTotalRides = () => {
    return new Promise((resolve, reject) => {
      db.get("SELECT COUNT(*) as total FROM Rides", (error, row) => {
        if (error) {
          reject(error);
        }
        if (row)
          resolve(row.total);
        else {
          resolve(0);
        }
      });
    });
  };

  const getRideById = (id) => {

    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM Rides WHERE rideID=?", [id], function (err, rows) {
          if (err) {
            reject(err);
          }
          resolve(rows);
        });
      });
  };

  return {
    addRide,
    getAllRides,
    getTotalRides,
    getRideById
  };
};
