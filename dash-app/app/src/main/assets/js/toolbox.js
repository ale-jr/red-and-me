import { createWebsocket } from "./services/websocket.js";

const handleMessage = (message) => {
  if (!message || !message.debug) return;
  const logEl = document.querySelector("#logs");
  const autoScroll = document.querySelector("#auto-scroll-checkbox").checked;

  logEl.value = `${logEl.value}\n${message.debug}`;
  if (autoScroll) {
    logEl.scrollTop = logEl.scrollHeight;
  }
};

const handleConnect = () => {
  document.querySelector("#enable-log-btn").addEventListener("click", () => {
    sendMessage({
      type: "enable-debug",
    });
  });

  document.querySelector("#disable-log-btn").addEventListener("click", () => {
    sendMessage({
      type: "disable-debug",
    });
  });

  const sendCommand = () => {
    const inputEl = document.querySelector("#command-input");
    sendMessage({
      type: "send-command",
      command: inputEl.value,
    });

    inputEl.value = "";
  };
  document
    .querySelector("#send-command-btn")
    .addEventListener("click", sendCommand);

  document
    .querySelector("#command-input")
    .addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        sendCommand();
      }
    });
};

const { sendMessage } = createWebsocket({
  device: "toolbox",
  onMessage: handleMessage,
  onOpen: handleConnect,
});
