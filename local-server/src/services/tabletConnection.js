import { execSync } from "child_process";
import { consts } from "../consts/index.js";

const createTabletConnection = () => {
  const isConnected = () => {
    const devicesCommand = execSync(`${consts.ADB_PATH} devices`);
    const result = devicesCommand.toString().split("\n");
    return result.some(
      (line) =>
        line.includes(consts.TABLET_ADDRESS) && !line.includes("offline")
    );
  };

  const connect = () => {
    execSync(`${consts.ADB_PATH} connect ${consts.TABLET_ADDRESS}`);
  };

  const intervalId = setInterval(() => {
    if (!isConnected()) {
      connect();
    }
  }, 5_000);

  connect();

  const disconnect = () => {
    clearInterval(intervalId);
  };

  const sendKey = (key) => {
    execSync(`${consts.ADB_PATH} shell input keyevent ${key}`);
  };
  return {
    isConnected,
    connect,
    disconnect,
    sendKey,
  };
};

export const KEYS = {
  home: 3,
  volumeUp: 24,
  volumeDown: 25,
  power: 26,
  playPause: 85,
  next: 87,
  previous: 88,
  mute: 164,
};

const createTableConnectionMock = () => {
  return {
    isConnected: () => true,
    connect: () => {
      console.log("adb mock connected");
    },
    disconnect: () => {
      console.log("adb mock disconnected");
    },
    sendKey: (key) => {
      console.log(`adb mock send key ${key}`);
    },
  };
};

export const tabletConnection =
  process.env.NODE_ENV === "production"
    ? createTabletConnection()
    : createTableConnectionMock();
