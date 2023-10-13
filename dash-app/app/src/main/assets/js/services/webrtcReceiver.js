import { getRandomId } from "./string.js";
import { log, LOG_LEVEL } from "./log.js";
/**
 * Cria um receptor WebRTC para lidar com a recepção de streams de vídeo.
 * @param {Object} options - As opções para o receptor WebRTC.
 * @param {Function} options.onStream - A função de retorno de chamada para lidar com a chegada de novos streams.
 * @param {Function} options.sendMessage - A função para enviar mensagens.
 * @returns {Object} Um objeto contendo métodos para lidar com a solicitação e resposta de streams de vídeo.
 * @typedef {Object} WebRTCReceiver
 * @property {Function} handleStreamRequestReply - Manipula uma resposta à solicitação de stream.
 * @property {Function} requestStream - Inicia uma solicitação de stream.
 */
export const createWebRTCReceiver = ({ onStream, sendMessage }) => {
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
      console.log("on track", event);
      onStream(event.streams[0]);
    };

    const offer = await connection.createOffer({
      offerToReceiveVideo: true,
    });

    await connection.setLocalDescription(offer);
  };
  return {
    handleStreamRequestReply,
    requestStream,
    closeAllConnections,
  };
};
