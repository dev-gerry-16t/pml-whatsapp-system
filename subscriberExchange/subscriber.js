import amqp from "amqplib";
import GLOBAL_CONSTANTS from "../constants/constants.js";

const exchangeName = GLOBAL_CONSTANTS.EXCHANGE;
const exchangeType = "direct";
const queue = GLOBAL_CONSTANTS.QUEUE_NAME;
const pattern = GLOBAL_CONSTANTS.ROUTING_KEY;

async function connectSubscriber() {
  try {
    const connection = await amqp.connect({
      protocol: GLOBAL_CONSTANTS.PROTOCOL_AMQP,
      username: GLOBAL_CONSTANTS.USERNAME_AMQP,
      password: GLOBAL_CONSTANTS.PASSWORD_AMQP,
      hostname: GLOBAL_CONSTANTS.HOST_AMQP,
      port: GLOBAL_CONSTANTS.PORT_AMQP,
    }); //GLOBAL_CONSTANTS.HOST_AMQP);
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, {
      messageTtl: 10000,
    });
    await channel.assertExchange(exchangeName, exchangeType);
    await channel.bindQueue(queue, exchangeName, pattern);

    return channel;
  } catch (error) {
    console.log("error", error);
  }
}

const Channel = connectSubscriber;

export default Channel;
