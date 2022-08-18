import GLOBAL_CONSTANTS from "../constants/constants.js";

const exchangeWhatsApp = GLOBAL_CONSTANTS.EXCHANGE;
const routingKeyWhatsApp = GLOBAL_CONSTANTS.ROUTING_KEY;
const queue = GLOBAL_CONSTANTS.QUEUE_NAME;

const configExchange = {
  type: "direct",
  assert: true,
};

const jsonConfig = {
  vhosts: {
    "/": {
      connection: {
        protocol: GLOBAL_CONSTANTS.PROTOCOL_AMQP,
        hostname: GLOBAL_CONSTANTS.HOST_AMQP,
        user: GLOBAL_CONSTANTS.USERNAME_AMQP,
        password: GLOBAL_CONSTANTS.PASSWORD_AMQP,
        port: GLOBAL_CONSTANTS.PORT_AMQP,
        options: {
          heartbeat: 5,
          connection_timeout: 10000,
        },
        retry: {
          min: 1000,
          max: 5000,
          strategy: "linear",
        },
      },
      queues: {
        [queue]: {},
      },
      subscriptions: {
        fromWhatsApp: {
          vhost: "/",
          queue: queue,
          prefetch: 1,
          retry: {
            delay: 1000,
          },
        },
      },
    },
  },
};

export default jsonConfig;
