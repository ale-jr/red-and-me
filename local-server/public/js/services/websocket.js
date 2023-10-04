import { getRandomId } from "./string.js";
import { log, LOG_LEVEL } from "./log.js";
export const createWebsocket = ({ onMessage, onOpen, device }) => {
    const url = `ws://${window.location.host}/live`
    const socket = new WebSocket(url);

    const clientId = getRandomId()

    /**
     * Send message using websocket connection
     * @param {*} message message oobject
     */
    let sendMessage = message => {
        log(LOG_LEVEL.DEBUG, "WebSocket send message", message)
        socket.send(JSON.stringify({ ...message, device, clientId }))
    }

    socket.onopen = (event) => {
        log(LOG_LEVEL.INFO, "WebSocket opened", event)
        if (typeof onOpen === "function") onOpen()
    }

    socket.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data)
            log(LOG_LEVEL.DEBUG, "WebSocket receive message", message)
            if (message.type === "ping") {
                keepAlive()
            }
            onMessage(message)
        }
        catch (error) {
            log(LOG_LEVEL.ERROR, "message error", error)
        }
    }

    socket.onerror = () => {
        setTimeout(handleReconnect, 2_000)
    }


    let timeoutId = -1
    const keepAlive = () => {
        log(LOG_LEVEL.INFO, "WebSocket keep alive")
        sendMessage({ type: "pong" })
        clearTimeout(timeoutId)
        setTimeout(handleReconnect, 5_000)
    }

    let wsResponse = {
        sendMessage,
        clientId
    }

    const handleReconnect = () => {
        log(LOG_LEVEL.WARN, "WebSocket reconnect")
        if (socket.readyState === socket.OPEN) {
            log(LOG_LEVEL.INFO, "WebSocket close")
            socket.close()
        }
        const newWebsocket = createWebsocket({ onMessage, onOpen, device })
        wsResponse = newWebsocket
    }

    return wsResponse
}