import GLOBAL_CONSTANTS from "../constants/constants.js";
import { createLogger, format, transports } from "winston";
import CloudWatchTransport from "winston-aws-cloudwatch";

const NODE_ENV = GLOBAL_CONSTANTS.NODE_ENV || "development";

const logger = new createLogger({
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple(),
        format.timestamp(),
        format.printf((info) => {
          return `${info.level} ${info.message}`;
        })
      ),
      timestamp: true,
      colorize: true,
    }),
  ],
});

const config = {
  logGroupName: "pmlWhatsAppSystemLog",
  logStreamName: GLOBAL_CONSTANTS.STREAM_LOG,
  createLogGroup: false,
  createLogStream: true,
  submissionInterval: 2000,
  submissionRetryCount: 1,
  jsonMessage: true,
  batchSize: 20,
  awsConfig: {
    accessKeyId: GLOBAL_CONSTANTS.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: GLOBAL_CONSTANTS.AWS_S3_SECRET_ACCESS_KEY,
    region: "us-east-2",
  },
  formatLog: (item) => `${item.level}: ${item.message}`,
};

if (NODE_ENV != "LOCAL") logger.add(new CloudWatchTransport(config));

export default logger;
