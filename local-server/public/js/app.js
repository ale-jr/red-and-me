import { LOG_LEVEL, log } from "./services/log.js";
import { createWebsocket } from "./services/websocket.js";
import { getRandomId } from "./services/string.js";
/**
 *
 * @param {Object} message
 */
const handleMessage = (message) => {
  switch (message.type) {
    case "camera-stream-reply":
      handleStreamRequestReply(message.payload, message.connectionId);
      break;
  }
};
const handleConnect = () => {};
const { sendMessage, clientId } = createWebsocket({
  onMessage: handleMessage,
  onOpen: handleConnect,
  device: "streammer",
});

/**
 * @typedef {Object.<string, RTCPeerConnection>} Connections
 */

/**
 * @type {Connections}
 */

const connections = {};

const closeAllConnections = () => {
  Object.entries(connections).forEach(([id, connection]) => {
    try {
      connection.close();
      delete connections[id];
      log(LOG_LEVEL.DEBUG, "closing connection");
    } catch (error) {
      log(
        LOG_LEVEL.INFO,
        "could not close connection",
        id,
        connection.connectionState
      );
    }
  });
};

const requestStream = async () => {
  closeAllConnections();

  const connection = new RTCPeerConnection({
    iceServers: [],
  });
  const connectionId = getRandomId();
  connections[connectionId] = connection;

  let timeoutId = -1;

  timeoutId = setTimeout(() => {
    log(LOG_LEVEL.WARN, "request stream timeout, retrying");
    requestStream();
  }, 3_000);

  connection.onconnectionstatechange = (event) => {
    const state = connection.connectionState;
    log(LOG_LEVEL.DEBUG, "RTCPeerConnection state change", state);
    switch (state) {
      case "closed":
        delete connections[connectionId];
        break;
      case "disconnected":
        setTimeout(requestStream, 1_000);
        break;
      case "connected":
        clearTimeout(timeoutId);
        break;
    }
  };

  connection.oniceconnectionstatechange = (event) =>
    log(
      LOG_LEVEL.DEBUG,
      "RTCPeerConnection ice state change",
      connection.iceConnectionState
    );

  connection.onicecandidate = (event) => {
    log(LOG_LEVEL.DEBUG, "RTCPeerConnection on ice candidate", event);
    if (!event.candidate) {
      sendMessage({
        type: "camera-stream-request",
        payload: connection.localDescription,
        connectionId,
      });
    }
  };

  connection.ontrack = (event) => {
    loadCamera(event.streams[0]);
  };

  const offer = await connection.createOffer({
    offerToReceiveVideo: true,
  });

  await connection.setLocalDescription(offer);
};

/**
 *
 * @param {RTCSessionDescriptionInit} reply
 * @param {string} connectionId
 * @returns
 */
const handleStreamRequestReply = async (reply, connectionId) => {
  const connection = connections[connectionId];
  if (!connection) {
    return log(LOG_LEVEL.ERROR, "cound not find connectionId");
  }

  await connection.setRemoteDescription(reply);
};

window.onload = () => {
  const button = document.querySelector("button");
  button?.addEventListener("click", () => requestStream());
};

/**
 *
 * @param {MediaStream} stream
 */
const loadCamera = (stream) => {
  /**
   *
   * @param {*} p5
   */
  const sketch = (p5) => {
    // const cameraVideo = p5.createCapture("video");
    // cameraVideo.size(720, 480);
    // cameraVideo.hide();
    // cameraVideo.elt.srcObject = stream;

    p5.setup = () => {
      const canvas = p5.createCanvas(720, 480);
      canvas.parent("camera-stream");

      p5.background("transparent");
    };

    p5.draw = () => {
      // p5.image(cameraVideo, 0, 0, 720, 480);
      p5.ellipse(50, 50, 80, 80);
    };
  };

  new p5(sketch);
};
