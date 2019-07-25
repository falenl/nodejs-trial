const winston = require("winston");
const { combine, timestamp, printf } = winston.format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} - ${level}: ${message}`;
});

const logger = winston.createLogger({
  level: "info",
  format: combine(
    timestamp(),
    myFormat
  ),
  defaultMeta: { service: "ride-service" },
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" })
  ]
});

module.exports = () => {
  const logError = function(message){
    logger.log({
      level: "error",
      message: message
    });
  };

  const logInfo = function(message){
    logger.log({
      level: "info",
      message: message
    });
  };
  return {
    logError,
    logInfo
  };
};
