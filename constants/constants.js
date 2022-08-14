const GLOBAL_CONSTANTS = {
  VERSION: "v0.0.2",
  OFFSET: process.env.OFFSET,
  PROTOCOL_AMQP: process.env.PROTOCOL_AMQP,
  USERNAME_AMQP: process.env.USERNAME_AMQP,
  PASSWORD_AMQP: process.env.PASSWORD_AMQP,
  PORT_AMQP: process.env.PORT_AMQP,
  HOST_AMQP: process.env.HOST_AMQP,
  EXCHANGE: process.env.EXCHANGE,
  ROUTING_KEY: process.env.ROUTING_KEY,
  QUEUE_NAME: process.env.QUEUE_NAME,
  USER_DATABASE: process.env.USER_DATABASE,
  PASS_DATABASE: process.env.PASS_DATABASE,
  SERVER_DATABASE: process.env.SERVER_DATABASE,
  DATABASE_NAME: process.env.DATABASE_NAME,
  DATABASE_PORT: 1433,
  MASTER_KEY_TOKEN: process.env.MASTER_KEY_TOKEN,
  AWS_S3_ACCESS_KEY_ID: process.env.AWS_S3_ACCESS_KEY_ID,
  AWS_S3_SECRET_ACCESS_KEY: process.env.AWS_S3_SECRET_ACCESS_KEY,
};

export default GLOBAL_CONSTANTS;
