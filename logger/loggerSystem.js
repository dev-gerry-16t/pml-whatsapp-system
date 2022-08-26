import isNil from "lodash/isNil.js";
import isEmpty from "lodash/isEmpty.js";
import isObject from "lodash/isObject.js";
import logger from "./configLogger.js";

const LoggerSystem = (
  sp = "",
  paramsIn = {},
  paramsOut = {},
  error = {},
  location = {}
) => {
  const errorMessage =
    isNil(error) === false &&
    isObject(error) === true &&
    isNil(error.message) === false &&
    isEmpty(error.message) === false
      ? error.message
      : "";
  const errorSystem = isNil(error) === false ? error : "";
  const objectLogString = JSON.stringify({
    errorMessage,
    errorSystem,
    paramsIn,
    paramsOut,
    location,
    storeProcedure: sp,
  });
  return {
    error: () => {
      logger.log({
        level: "error",
        message: objectLogString,
      });
    },
    warn: () => {
      logger.log({
        level: "warn",
        message: objectLogString,
      });
    },
    info: () => {
      logger.log({
        level: "info",
        message: objectLogString,
      });
    },
  };
};

export default LoggerSystem;
