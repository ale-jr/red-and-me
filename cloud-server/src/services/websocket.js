
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


  try {
    const { type, command } = JSON.parse(message);
    //TODO: do something
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
  const stringifiedMessage = JSON.stringify(message)
  Object.entries(sockets).forEach(([_, socket]) => {
    socket.send(stringifiedMessage);
  });
};
