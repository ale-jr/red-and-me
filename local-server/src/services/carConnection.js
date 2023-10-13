import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import { consts } from "../consts/index.js";
import { KEYS, tabletConnection } from "./tabletConnection.js";
import { debugMode, sendToAll } from "./websocket.js";

import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { execSync } from "node:child_process";

const rl = readline.createInterface({ input, output });

rl.on("line", (input) => {
  console.log(`Received: ${input}`);
  carConnection.handleData(input);
});

const createCarConnection = () => {
  const port = new SerialPort({
    path: consts.SERIAL_PORT_PATH,
    baudRate: 115200,
  });

  const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

  const handleData = (data) => {
    console.log("data", data);
    const stringifiedData = String(data);
    const type = stringifiedData.split("|")[0];

    switch (type) {
      case "S":
        handleStatusMessage(stringifiedData);
        break;
      case "SWC":
        handleSteeringWheelControl(stringifiedData);
        break;
    }

    if (debugMode) {
      sendToAll({
        debug: stringifiedData,
      });
    }
  };

  parser.on("data", handleData);

  /**
   *
   * @param {string} data -  raw serial message
   */
  const handleStatusMessage = (data) => {
    const [type, status, code] = data.split("|");
    console.log("handle status message", { type, status, code });
    if (status === "shutdown_request") {
      console.log("shutting down!");
      execSync(consts.SHUTDOWN_COMMAND);
    }
  };

  let lastCommand = {
    key: "",
    at: 0,
  };
  const keyDebounce = 500;
  /**
   *
   * @param {string} data - raw serial message
   */
  const handleSteeringWheelControl = (data) => {
    const keys = parseSerialMessage(data, [
      {
        name: "type",
      },
      {
        name: "leftUp",
        type: "bool",
      },
      {
        name: "leftMiddle",
        type: "bool",
      },
      {
        name: "leftDown",
        type: "bool",
      },
      {
        name: "rightUp",
        type: "bool",
      },
      {
        name: "rightMiddle",
        type: "bool",
      },
      {
        name: "rightDown",
        type: "bool",
      },
      {
        name: "mute",
        type: "bool",
      },
      {
        name: "voiceAssistant",
        type: "bool",
      },
      {
        name: "acceptCall",
        type: "bool",
      },
      {
        name: "endCall",
        type: "bool",
      },
    ]);
    console.log("keys", keys);

    const verifyDebounce = (key, debounce = keyDebounce) => {
      if (lastCommand.key === key && lastCommand.at + debounce > Date.now())
        return false;
      lastCommand = {
        key,
        at: Date.now(),
      };
      return true;
    };

    if (keys.rightUp) {
      if (!verifyDebounce("rightUp")) return;
      tabletConnection.sendKey(KEYS.volumeUp);
    }

    if (keys.rightMiddle) {
      tabletConnection.sendKey(KEYS.mute);
    }

    if (keys.rightDown) {
      if (!verifyDebounce("rightDown")) return;
      tabletConnection.sendKey(KEYS.volumeDown);
    }

    if (keys.leftUp) {
      if (!verifyDebounce("leftUp")) return;
      tabletConnection.sendKey(KEYS.previous);
    }

    if (keys.leftMiddle) {
      tabletConnection.sendKey(KEYS.playPause);
    }

    if (keys.leftDown) {
      if (!verifyDebounce("leftDown")) return;
      tabletConnection.sendKey(KEYS.next);
    }

    if (keys.mute) {
      tabletConnection.sendKey(KEYS.mute);
    }

    if (keys.voiceAssistant) {
      if (!verifyDebounce("voiceAssistant", 1000)) return;
      tabletConnection.sendKey(KEYS.home);
    }
  };

  const sendMessage = (message) => {
    console.log("send message", message);
    port.write(message, (error) => {
      if (error)
        sendToAll({
          debug: `could not send message "${message}"(${error.message})`,
        });
      else
        sendToAll({
          debug: `sent: ${message}`,
        });
    });
  };

  return {
    sendMessage,
    handleData,
  };
};

/**
 *
 * @param {string} message
 * @param {Object[]} header
 */
export const parseSerialMessage = (message, header) => {
  const parts = message.split("|");

  const parsed = {};
  parts.forEach((part, index) => {
    const { name, type } = header[index];

    let parsedValue = part;
    switch (type) {
      case "bool":
        parsedValue = part === "1";
        break;
      case "number":
        parsedValue = +part;
        break;
    }
    parsed[name] = parsedValue;
  });
  return parsed;
};

const createCarConnectionMock = () => ({
  sendMessage: (message) => console.log("send message mock", message),
  handleData: (data) => console.log("handle data mock", data),
});

export const carConnection =
  process.env.NODE_ENV === "production"
    ? createCarConnection()
    : createCarConnectionMock();
