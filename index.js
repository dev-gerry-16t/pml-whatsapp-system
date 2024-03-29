import "dotenv/config";
import sql from "mssql";
import AWS from "aws-sdk";
import Channel from "./subscriberExchange/subscriber.js";
import CONFIG from "./database/configDb.js";
import GLOBAL_CONSTANTS from "./constants/constants.js";
import isEmpty from "lodash/isEmpty.js";
import isNil from "lodash/isNil.js";
import RequestPromise from "request-promise";
import Axios from "axios";
import createBearerToken from "./actions/createBearerToken.js";
import stream from "stream";

const s3 = new AWS.S3({
  accessKeyId: GLOBAL_CONSTANTS.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: GLOBAL_CONSTANTS.AWS_S3_SECRET_ACCESS_KEY,
});
const queueReceive = GLOBAL_CONSTANTS.QUEUE_NAME;

const executeSetMessage = async (params) => {
  const {
    idMessage,
    jsonServiceResponse,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;
  const storeProcedure = "wsSch.USPsetMessage";
  const locationCode = {
    function: "executeSetMessage",
    file: "index.js",
    container: "pml-whatsapp-system",
  };
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_uidIdMessage", sql.NVarChar, idMessage)
      .input(
        "p_nvcJsonServiceResponse",
        sql.NVarChar(sql.MAX),
        jsonServiceResponse
      )
      .input("p_chrOffset", sql.Char(6), offset)
      .execute(storeProcedure);
  } catch (error) {
    throw error;
  }
};

const executeMessageMarkAsRead = async (params) => {
  const { method, endpoint, body, token } = params;
  try {
    const bodyParse = JSON.parse(body);
    const response = await RequestPromise({
      url: endpoint,
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      json: true,
      body: bodyParse,
      rejectUnauthorized: false,
    });
  } catch (error) {
    throw error;
  }
};

const executeMessageOutGoing = async (params) => {
  const {
    method,
    endpoint,
    body,
    token,
    idMessage,
    hasToken,
    idSystemUser,
    idLoginHistory,
    expireIn,
  } = params;
  let messageToWhatsApp = body;

  try {
    if (hasToken === true && isEmpty(body) === false) {
      const tokenApp = await createBearerToken({
        idSystemUser,
        idLoginHistory,
        tokenExpiration: expireIn,
      });
      messageToWhatsApp = body.replace("{{token}}", tokenApp);
    }
    const bodyParse = JSON.parse(messageToWhatsApp);
    const response = await RequestPromise({
      url: endpoint,
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      json: true,
      body: bodyParse,
      rejectUnauthorized: false,
    });
    await executeSetMessage({
      idMessage,
      jsonServiceResponse: JSON.stringify(response),
    });
  } catch (error) {
    throw error;
  }
};

const executeDeleteFile = async (params) => {
  const { idDocument, bucketSource } = params;
  try {
    const paramsAws = {
      Bucket: bucketSource,
      Key: idDocument,
    };
    await s3.deleteObject(paramsAws).promise();
  } catch (error) {
    throw error;
  }
};

const uploadStreamToS3 = (paramsAws, resolve, reject) => {
  const pass = new stream.PassThrough();
  const paramsS3 = { ...paramsAws, Body: pass };
  s3.upload(paramsS3, function (err, data) {
    if (err) {
      return reject("Error upload on AWS");
    }
    return resolve(data);
  });
  return pass;
};

const getFileFromUrl = (paramsFetch, paramsAws) => {
  const { url, mime_type, token } = paramsFetch;
  const promiseFile = new Promise((resolve, reject) => {
    Axios(url, {
      responseType: "stream",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-type": mime_type,
      },
    })
      .then((res) => {
        if (res.status === 200 || res.status === "200") {
          res.data.pipe(uploadStreamToS3(paramsAws, resolve, reject));
        } else {
          throw `Error status ${res.status}`;
        }
      })
      .catch((error) => {
        reject(error);
      });
  });

  return promiseFile;
};

const executeUploadFile = async (params) => {
  const { idDocument, bucketSource, method, endpoint, token } = params;
  try {
    const response = await RequestPromise({
      url: endpoint,
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      json: true,
      rejectUnauthorized: false,
    });
    if (isNil(response) === false && isEmpty(response) === false) {
      const { url, mime_type } = response;
      const paramsAws = {
        Bucket: bucketSource,
        Key: idDocument,
      };
      await getFileFromUrl({ url, mime_type, token }, paramsAws);
    } else {
      throw `Error call ${endpoint}`;
    }
  } catch (error) {
    throw error;
  }
};

const executeSetWSWebhook = async (params) => {
  const { jsonServiceResponse, offset = GLOBAL_CONSTANTS.OFFSET } = params;
  const storeProcedure = "wsSch.USPsetWSWebhook";
  const locationCode = {
    function: "executeSetWSWebhook",
    file: "signIn.js",
    container: "pml-whatsapp-system",
  };
  let transaction = null;
  let open = false;
  try {
    const pool = await sql.connect();
    transaction = new sql.Transaction(pool);
    transaction.on("begin", () => {
      open = true;
    });
    transaction.on("commit", () => {
      open = false;
    });
    transaction.on("rollback", () => {
      open = false;
    });

    await transaction.begin();
    const result = await pool
      .request(transaction)
      .input(
        "p_nvcJsonServiceResponse",
        sql.NVarChar(sql.MAX),
        jsonServiceResponse
      )
      .input("p_chrOffset", sql.Char(6), offset)
      .execute(storeProcedure);
    const resultObject =
      isEmpty(result) === false &&
      isEmpty(result.recordset) === false &&
      isNil(result.recordset[0]) === false &&
      isEmpty(result.recordset[0]) === false
        ? result.recordset[0]
        : [];
    const resultRecordSets =
      isEmpty(result) === false && isEmpty(result.recordsets) === false
        ? result.recordsets
        : [];
    const messagesInSee =
      isEmpty(resultRecordSets) === false &&
      isNil(resultRecordSets[1]) === false &&
      isEmpty(resultRecordSets[1]) === false
        ? resultRecordSets[1]
        : [];
    const messagesToSend =
      isEmpty(resultRecordSets) === false &&
      isNil(resultRecordSets[2]) === false &&
      isEmpty(resultRecordSets[2]) === false
        ? resultRecordSets[2]
        : [];
    const messagesDocuments =
      isEmpty(resultRecordSets) === false &&
      isNil(resultRecordSets[3]) === false &&
      isEmpty(resultRecordSets[3]) === false
        ? resultRecordSets[3]
        : [];
    if (isEmpty(resultObject) === false && resultObject.stateCode !== 200) {
      throw `Error en el servicio ${resultObject.stateCode}`;
    } else {
      if (isEmpty(resultRecordSets) === false) {
        for (const element of messagesInSee) {
          if (isNil(element.endpoint) === false) {
            await executeMessageMarkAsRead(element);
          }
        }
        for (const element of messagesDocuments) {
          if (element.mustBeDeleted === true) {
            await executeDeleteFile(element);
          } else {
            await executeUploadFile(element);
          }
        }
        for (const element of messagesToSend) {
          if (isNil(element.endpoint) === false) {
            await executeMessageOutGoing(element);
          }
        }
      }
    }
    await transaction.commit();
  } catch (error) {
    open && (await transaction.rollback());
  }
};

sql.connect(CONFIG, async (error, res) => {
  if (error) {
    console.log("error", error);
  }
  if (res) {
    try {
      const channel = await Channel();

      channel.consume(queueReceive, async (message) => {
        const content = message.content.toString();
        try {
          await executeSetWSWebhook({ jsonServiceResponse: content });
          channel.ack(message);
        } catch (error) {
          channel.ack(message);
        }
      });
    } catch (error) {
      console.log("error", error);
    }
  }
});
