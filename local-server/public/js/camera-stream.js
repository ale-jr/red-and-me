import { createWebsocket } from "./services/websocket.js";
import { LOG_LEVEL, log } from "./services/log.js";
import { rearViewCameraStream } from "./services/rearViewCameraStream.js";

/**
 *
 * @param {RTCSessionDescriptionInit} offer
 * @param {string} connectionId
 */
const replyStreamRequest = async (offer, connectionId) => {
  log(LOG_LEVEL.INFO, "Answer stream request");
  const connection = new RTCPeerConnection({
    iceServers: [],
  });

  connection.onconnectionstatechange = (event) => {
    const state = connection.connectionState;
    log(LOG_LEVEL.DEBUG, "RTCPeerConnection state change", state);
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
        type: "camera-stream-reply",
        payload: connection.localDescription,
        connectionId,
      });
    }
  };

  await connection.setRemoteDescription(offer);

  const stream = await rearViewCameraStream.startStream();
  stream.getTracks().forEach((track) => connection.addTrack(track, stream));

  const answer = await connection.createAnswer();
  await connection.setLocalDescription(answer);
};

const { sendMessage } = createWebsocket({
  onMessage: (message) => {
    if (message.type === "camera-stream-request")
      replyStreamRequest(message.payload, message.connectionId);
  },
});

onerror = (event, source, lineno, colno, error) => {
  sendMessage({
    err: {
      event,
      source,
      lineno,
      colno,
      error,
    },
  });
};
