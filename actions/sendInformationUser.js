import sql from "mssql";
import isEmpty from "lodash/isEmpty.js";
import isNil from "lodash/isNil.js";
import GLOBAL_CONSTANTS from "../constants/constants.js";
import smtpTransporter from "./smtpTransport.js";
import LoggerSystem from "./logger/loggerSystem.js";

const executeEmailSentAES = async (params) => {
  const {
    idEmailTemplate,
    idUserSender,
    idUserReceiver = null,
    receiver,
    subject,
    sender,
    content,
    emailTrack = null,
    offset = GLOBAL_CONSTANTS.OFFSET,
  } = params;

  const storeProcedure = "comSch.USPaddEmailSent";
  const locationCode = {
    function: "executeEmailSentAES",
    file: "sendInformationUser.js",
  };
  try {
    const pool = await sql.connect();
    const result = await pool
      .request()
      .input("p_intIdEmailTemplate", sql.Int, idEmailTemplate)
      .input("p_uidIdUserSender", sql.NVarChar, idUserSender)
      .input("p_uidIdUserReceiver", sql.NVarChar, idUserReceiver)
      .input("p_vchReceiver", sql.VarChar(256), receiver)
      .input("p_vchSender", sql.VarChar(256), sender)
      .input("p_vchSubject", sql.VarChar(64), subject)
      .input("p_nvcContent", sql.NVarChar, content)
      .input("p_nvcEmailTrack", sql.NVarChar, emailTrack)
      .input("p_chrOffset", sql.Char, offset)
      .execute(storeProcedure);
    const resultRecordsetObject =
      isEmpty(result.recordset) === false &&
      isNil(result.recordset[0]) === false &&
      isEmpty(result.recordset[0]) === false
        ? result.recordset[0]
        : {};
    if (isEmpty(resultRecordsetObject) === false) {
      if (resultRecordsetObject.stateCode !== 200) {
        LoggerSystem(
          storeProcedure,
          params,
          resultRecordsetObject,
          {},
          locationCode
        ).warn();
        return {};
      } else {
        return resultRecordsetObject;
      }
    } else {
      LoggerSystem(
        storeProcedure,
        params,
        resultRecordsetObject,
        {},
        locationCode
      ).warn();
      return {};
    }
  } catch (error) {
    LoggerSystem(storeProcedure, params, {}, error, locationCode).error();
    return {};
  }
};

const executeMailTo = async (params) => {
  const {
    receiver,
    content,
    subject,
    sender,
    tags = null,
    template_name,
    global_merge_vars,
    pushVar = [],
  } = params;

  const locationCode = {
    function: "executeEmailSentAES",
    file: "sendInformationUser.js",
  };

  try {
    const { idEmailSent = null } = await executeEmailSentAES(params);
    const message = {};

    if (isNil(idEmailSent) === false) {
      message.metadata = {
        idEmailSent,
      };
    }
    if (isNil(tags) === false && isEmpty(tags) === false) {
      message.tags = JSON.parse(tags);
    }
    if (
      isNil(global_merge_vars) === false &&
      isEmpty(global_merge_vars) === false
    ) {
      let arrayVars = JSON.parse(global_merge_vars);
      if (isEmpty(pushVar) === false) {
        arrayVars = [...arrayVars, ...pushVar];
      }
      message.global_merge_vars = arrayVars;
    }

    const mailOptions = {
      from: sender,
      bcc: receiver,
      subject,
      html: content,
      mandrillOptions: {
        template_name,
        template_content: [],
        message: {
          ...message,
          merge: true,
          merge_language: "handlebars",
        },
      },
    };
    await smtpTransporter.sendMail(mailOptions);
  } catch (error) {
    LoggerSystem("Mandrill", params, {}, error, locationCode).error();
  }
};

export default executeMailTo;
