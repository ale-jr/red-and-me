import { startWidgets } from "./components/widgets.js";
import "./components/CameraWidget.js";
import "./components/NavigationWidget/index.js";
import "./components/SettingsModal.js";
import "./components/NavigationItem.js";
import "./components/SpotifyWidget.js";
import { createWebsocket } from "./services/websocket.js";
import { LOG_LEVEL, log } from "./services/log.js";
import { WS_MESSAGE, WS_SEND_MESSAGE } from "./consts/events.js";

try {
  startWidgets();
  const { sendMessage } = createWebsocket({
    device: "dash",
    onMessage: (data) => {
      const event = new CustomEvent(WS_MESSAGE, {
        detail: data,
      });

      document.dispatchEvent(event);
      console.log("data", data);
    },
    onOpen: () => {
      log(LOG_LEVEL.INFO, "websocket connected");
    },
  });

  document.addEventListener(WS_SEND_MESSAGE, (event) => {
    sendMessage(event.detail);
  });
} catch (error) {
  console.log("could not start widgets");
}
window.onload = () => {
  startWidgets();
  ("");
};
