import GLOBAL_CONSTANTS from "../constants/constants.js";

const {
  USER_DATABASE,
  PASS_DATABASE,
  SERVER_DATABASE,
  DATABASE_NAME,
  DATABASE_PORT,
} = GLOBAL_CONSTANTS;

const CONFIG = {
  user: USER_DATABASE,
  password: PASS_DATABASE,
  server: SERVER_DATABASE,
  database: DATABASE_NAME,
  port: DATABASE_PORT,
  options: {
    encrypt: false,
    enableArithAbort: true,
  },
  //   pool: {
  //       max: 10,
  //       min: 0,
  //       idleTimeoutMillis: 30000
  //   }
};

export default CONFIG;
