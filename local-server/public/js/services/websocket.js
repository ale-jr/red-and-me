import { getRandomId } from "./string.js";
import { log, LOG_LEVEL } from "./log.js";
import { LOCAL_SERVER_WS_URL } from "../consts/urls.js";
export const createWebsocket = ({ onMessage, onOpen, device }) => {
  const url = `${LOCAL_SERVER_WS_URL}/live`;
  const socket = new WebSocket(url);

  let watchdogIntervalId = null;

  const clientId = getRandomId();

  /**
   * Send message using websocket connection
   * @param {*} message message oobject
   */
  let sendMessage = (message) => {
    log(LOG_LEVEL.DEBUG, "WebSocket send message", message);
    socket.send(JSON.stringify({ ...message, device, clientId }));
  };

  socket.onopen = (event) => {
    log(LOG_LEVEL.INFO, "WebSocket opened", event);
    if (typeof onOpen === "function") onOpen();

    keepAlive();
  };

  const keepAlive = () => {
    clearTimeout(watchdogIntervalId)

    setTimeout(() => {
      sendMessage({
        type: 'ping'
      })
    }, 1500)

    watchdogIntervalId = setTimeout(() => {
      handleReconnect()
    }, 2000)
  }

  socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      log(LOG_LEVEL.DEBUG, "WebSocket receive message", message);
      if (message.type === "pong") {
        keepAlive();
      }
      onMessage(message);
    } catch (error) {
      log(LOG_LEVEL.ERROR, "message error", error);
    }
  };

  socket.onerror = () => {
    setTimeout(handleReconnect, 2_000);
  };

  let wsResponse = {
    sendMessage,
    clientId,
  };

  const handleReconnect = () => {
    log(LOG_LEVEL.WARN, "WebSocket reconnect");
    if (socket.readyState === socket.OPEN) {
      log(LOG_LEVEL.INFO, "WebSocket close");
      socket.close();
    }
    const newWebsocket = createWebsocket({ onMessage, onOpen, device });
    wsResponse = newWebsocket;
  };

  return wsResponse;
};
