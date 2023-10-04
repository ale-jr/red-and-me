import { carConnection } from "./carConnection.js";
export let debugMode = false;

/**
 * @typedef {Object} Message
 * @property {string} type - message type
 * @property {Object} payload - message payload
 */

/**
 *
 * @param {Message} message
 * @param {WebSocket} socket
 * @param {string} clientId
 */
export const onMessage = (message, socket, clientId) => {
  Object.entries(sockets).forEach(([client, socket]) => {
    if (client !== clientId) socket.send(message.toString());
  });

  try {
    const { type, command } = JSON.parse(message);

    switch (type) {
      case "enable-debug":
        debugMode = true;
        break;
      case "disable-debug":
        debugMode = false;
        break;
      case "send-command":
        if (debugMode) {
          carConnection.sendMessage(command);
        }
        break;
    }
  } catch (e) {
    console.error("e", e);
  }
};

/**
 * @typedef {Object.<string, WebSocket>} SocketsByClient
 */

/**
 * @type {SocketsByClient}
 */

export const sockets = {};

/**
 *
 * @param {WebSocket} socket
 * @param {string} clientId
 */
export const onConnect = (socket, clientId) => {
  console.log("Client id ", clientId, " connected");
  sockets[clientId] = socket;
};

/**
 *
 * @param {WebSocket} socket
 * @param {string} clientId
 */
export const onDisconnect = (socket, clientId) => {
  delete sockets[clientId];
};

/**
 *
 * @param {Object} message
 */
export const sendToAll = (message) => {
  Object.entries(sockets).forEach(([_, socket]) => {
    socket.send(JSON.stringify(message));
  });
};
