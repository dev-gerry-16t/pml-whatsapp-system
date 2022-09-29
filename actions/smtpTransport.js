import nodemailer from "nodemailer";
import mandrillTemplateTransport from "nodemailer-mandrill-transport";
import GLOBAL_CONSTANTS from "../constants/constants.js";

const smtpTransporter = nodemailer.createTransport(
  mandrillTemplateTransport({
    auth: {
      apiKey: GLOBAL_CONSTANTS.KEY_MANDRILL,
    },
  })
);

export default smtpTransporter;
