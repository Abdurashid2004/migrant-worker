const express = require("express");
const config = require("config");
const cookieParser = require("cookie-parser");
const error_handler = require("./middlewares/errora_handling_middleware");

const PORT = config.get("port");
const mainRouter = require("./routers/index");
const {
  expressLogger,
  expressLoggerwinstonError,
} = require("./middlewares/logger_winston");

const app = express();

app.use(express.json());
app.use(cookieParser()); //

app.use(expressLogger);
app.use("/api", mainRouter);

app.use(expressLoggerwinstonError);

app.use(error_handler);

async function start() {
  try {
    app.listen(PORT, () => {
      console.log(`Server started at: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

start();
