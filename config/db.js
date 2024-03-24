const { Pool } = require("pg");
const config = require("config");

const pool = new Pool({
  user: config.get("db_username"),
  password: config.get("db_password"),
  database: config.get("db_name"),
  host: config.get("db_host"),
  port: config.get("db_port"),
});

module.exports = pool;
