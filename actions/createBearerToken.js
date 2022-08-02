import jwt from "jsonwebtoken";
import GLOBAL_CONSTANTS from "../constants/constants.js";

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
    throw error;
  }
};

export default createBearerToken;
