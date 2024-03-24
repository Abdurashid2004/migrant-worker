// const expressWinston = require("express-winston");
// const config = require("config");
// const { format, transports } = require("winston");
// const { combine, timestamp, prettyPrint, metadata } = format;

// const expressLogger = expressWinston.logger({
//   transports: [
//     new transports.File({
//       db: config.get("log"),
//       options: { useUnfiedTopology: true },
//     }),
//     new transports.Console(),
//   ],
//   format: winston.format.combine(timestamp(), prettyPrint(), metadata()),
//   meta: true, // optional: control whether you want to log the meta data about the request (default to true)
//   msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
//   expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
//   colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
//   ignoreRoute: function (req, res) {
//     return false;
//   },
// });

// const expressLoggerwinstonError = expressWinston.errorLogger({
//   transports: [
//     new winston.transports.File({ filename: "wins.error", level: "error" }),
//   ],
//   format: combine(prettyPrint()),
// });

// module.exports = {
//   expressLogger,
//   expressLoggerwinstonError,
// };
const expressWinston = require("express-winston");
const { createLogger, format, transports } = require("winston");
const config = require("config");

// Log format
const myFormat = format.combine(
  format.timestamp(),
  format.prettyPrint(),
  format.metadata()
);

const expressLogger = expressWinston.logger({
  transports: [
    new transports.File({
      filename: "log/xato.log",
      level: "info",
    }),
    new transports.Console(),
  ],
  format: myFormat,
  meta: true,
  msg: "HTTP {{req.method}} {{req.url}}",
  expressFormat: true,
  colorize: false,
  ignoreRoute: function (req, res) {
    return false;
  },
});

const expressLoggerwinstonError = expressWinston.errorLogger({
  transports: [
    new transports.File({
      filename: "log/error.log",
      level: "error",
    }),
  ],
  format: myFormat,
});

module.exports = {
  expressLogger,
  expressLoggerwinstonError,
};
