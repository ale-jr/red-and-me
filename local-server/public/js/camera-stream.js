import { createWebsocket } from "./services/websocket.js";
import { LOG_LEVEL, log } from "./services/log.js";


/**
 * @type {MediaStream}
 */
let webcamStream = null

const getWebCamStream = async () => {
    if (webcamStream) return webcamStream
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            height: {
                exact: 240
            },
            width: {
                exact: 320
            },
            frameRate: {
                ideal: 20
            }
        }
    })
    webcamStream = stream
    return webcamStream
}


/**
 * 
 * @param {RTCSessionDescriptionInit} offer 
 * @param {string} connectionId 
 */
const replyStreamRequest = async (offer, connectionId) => {
    log(LOG_LEVEL.INFO, "Answer stream request")
    const connection = new RTCPeerConnection({
        iceServers: []
    })

    connection.onconnectionstatechange = (event) => {
        const state = connection.connectionState
        log(LOG_LEVEL.DEBUG, "RTCPeerConnection state change", state)

    }

    connection.oniceconnectionstatechange = (event) => log(LOG_LEVEL.DEBUG, "RTCPeerConnection ice state change", connection.iceConnectionState)

    connection.onicecandidate = (event) => {
        log(LOG_LEVEL.DEBUG, "RTCPeerConnection on ice candidate", event)
        if (!event.candidate) {
            sendMessage({
                type: "camera-stream-reply",
                payload: connection.localDescription,
                connectionId
            })
        }
    }

    await connection.setRemoteDescription(offer)

    const webcamStream = await getWebCamStream()
    webcamStream.getTracks().forEach(track => connection.addTrack(track, webcamStream))

    const answer = await connection.createAnswer()
    await connection.setLocalDescription(answer)

}


const { sendMessage } = createWebsocket({
    onMessage: (message) => {
        if (message.type === "camera-stream-request")
            replyStreamRequest(message.payload, message.connectionId);
    }
})

