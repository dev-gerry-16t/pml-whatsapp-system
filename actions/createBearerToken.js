import jwt from "jsonwebtoken";
import GLOBAL_CONSTANTS from "../constants/constants.js";
import LoggerSystem from "../logger/loggerSystem.js";

const createBearerToken = async (params) => {
  const { idSystemUser, idLoginHistory, tokenExpiration } = params;
  try {
    const payload = {
      idSystemUser,
      idLoginHistory,
    };
    const token = jwt.sign(payload, GLOBAL_CONSTANTS.MASTER_KEY_TOKEN, {
      expiresIn: tokenExpiration,
    });

    return token;
  } catch (error) {
    LoggerSystem("createBearerToken", params, {}, error, {
      container: "pml-whatsapp-system",
    }).error();
  }
};

export default createBearerToken;
